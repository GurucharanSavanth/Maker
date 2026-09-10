"""Reproducible survey text preparation. Run --help; raw workbook is never exported."""
import argparse
from collections import Counter, defaultdict
import hashlib
import importlib.metadata
import json
import math
from pathlib import Path
import random
import re
import unicodedata

import openpyxl
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

HERE = Path(__file__).resolve().parent
VERSION = "1.0.1"
SEED = 20260909
FIELDS = {"incident": 21, "best": 30, "improvement": 31}
PLACEHOLDER = "No service failure is included in this persona."
TOKEN = re.compile(r"[a-z0-9]+(?:['-][a-z]+)?")
EMAIL = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
PHONE = re.compile(r"(?<!\w)\+?\d[\d ()-]{8,}\d(?!\w)")
STOP = set("a about after all also am an and any are around as at be because been before being between both but by can could did do does during each even for from had has have how i if in into is it its me most much my of on one or our out over so some than that the their them then there these they this those through to too up us very was we were what when where which while who will with would you your no not more should without rather such only another again enough still just every earlier really".split())
# ponytail: phrase selection uses an observed boilerplate exclusion list; use a reviewed domain corpus if the questionnaire or writing style changes.
BOILERPLATE = set("experience service provider thing part main biggest improvement issue practical sensible current overall still feels feel right now mostly satisfied recurring better handling unfinished especially useful dependable predictable constant problem notice prefer like work travel daily commute home railway stations near outskirts office hours evenings weekends parents college highway stretches shopping malls busy public events travelling cities late night month-end needed little friction strongest fairly smooth worked well reason confidence unnecessary follow-up saves time useful matters consistency flashy complicated simple normally usually exactly use small day depend easier value needs improve make area appreciate probably continue biggest practical first last happens happened faced situation remember clearly worst difficult serious inconvenience problem problems frustrating frustrated expected wanted took effect affected important period most including someone later eventually repeated direct clear found less next step would required particularly because need want much few always often existing necessary basics gets gets actually basic event account event work trips ordinary focus meant avoidable manageable unpredictable unusually".split())


def normalized(text):
    return " ".join(unicodedata.normalize("NFKC", str(text or "")).split())


def match_text(text):
    return " ".join(re.findall(r"[a-z0-9]+", normalized(text).lower()))


def redact(text):
    counts = Counter()
    def email(_):
        counts["emails"] += 1
        return "[email redacted]"
    def phone(m):
        if 10 <= len(re.sub(r"\D", "", m.group())) <= 15:
            counts["phones"] += 1
            return "[phone redacted]"
        return m.group()
    return PHONE.sub(phone, EMAIL.sub(email, text)), counts


def classify(compound):
    return "positive" if compound >= .05 else "negative" if compound <= -.05 else "neutral"


def detect_themes(text, dictionary):
    padded = " " + match_text(text) + " "
    return [theme["id"] for theme in dictionary["themes"] if any(" " + match_text(p) + " " in padded for p in theme["phrases"])]


def phrases(text):
    tokens = TOKEN.findall(normalized(text).lower())
    result = Counter()
    for n in (1, 2, 3):
        for i in range(len(tokens) - n + 1):
            span = tokens[i:i+n]
            if span[0] in STOP or span[-1] in STOP:
                continue
            if not any(t not in STOP | BOILERPLATE and len(t) > 2 for t in span):
                continue
            if n == 1 and span[0] in BOILERPLATE:
                continue
            result[" ".join(span)] += 1
    return result


def phrase_rankings(records):
    """TF-IDF uses per-response term count, smoothed document IDF and mean score."""
    groups = defaultdict(list)
    for r in records:
        groups[(r["field"], r["provider"])].append(r)
        groups[(r["field"], "All")].append(r)
    rankings = {}
    for (field, provider), group in sorted(groups.items()):
        counts = [phrases(r["text"]) for r in group]
        df = Counter(p for c in counts for p in c)
        tfidf = Counter()
        for c in counts:
            length = max(1, sum(c.values()))
            for p, count in c.items():
                tfidf[p] += count / length * (math.log((1 + len(group)) / (1 + df[p])) + 1)
        ranked = [{"phrase": p, "n": len(p.split()), "documents": df[p], "tfidf": round(score/len(group), 7)} for p, score in tfidf.items() if df[p] >= 2]
        ranked.sort(key=lambda p: (-p["tfidf"], p["phrase"]))
        rankings.setdefault(field, {})[provider] = {"denominator": len(group), "phrases": ranked[:60], "byLength": {str(n): [p for p in ranked if p["n"] == n][:20] for n in (1, 2, 3)}}
        if provider == "All":
            allowed = set(p["phrase"] for p in ranked)
            for r, c in zip(group, counts):
                r["phrases"] = sorted((p for p in c if p in allowed), key=lambda p: (-(c[p]*(math.log((1+len(group))/(1+df[p]))+1)), p))[:12]
    return rankings


def validate(records, annotations):
    lookup = {(r["id"], r["field"]): r for r in records}
    chosen = []
    rng = random.Random(SEED)
    for field in FIELDS:
        for provider in ("Airtel", "Jio"):
            group = [r for r in records if r["field"] == field and r["provider"] == provider]
            chosen.extend((r["id"], r["field"]) for r in rng.sample(group, 20))
    assert chosen == [(r["id"], r["field"]) for r in annotations["annotations"]], "Review sample no longer matches source/seed. Re-review before publication."
    matrix = {a: {b: 0 for b in ("negative", "neutral", "positive")} for a in ("negative", "neutral", "positive")}
    discrepancies = []
    theme_misses = []
    per_field = defaultdict(lambda: {"n": 0, "sentimentCorrect": 0, "primaryThemeCovered": 0})
    reviews = []
    for label in annotations["annotations"]:
        row = lookup[(label["id"], label["field"])]
        assert normalized(label["text"]) == normalized(row["text"]), "Text changed; semantic labels need review."
        matrix[label["sentiment_label"]][row["sentiment"]] += 1
        current = {"id": row["id"], "field": row["field"], "provider": row["provider"], "expected": label["sentiment_label"], "predicted": row["sentiment"], "compound": row["compound"], "primaryTheme": label["primary_theme_label"], "matchedThemes": row["themes"]}
        reviews.append(current)
        if label["sentiment_label"] != row["sentiment"]:
            discrepancies.append(current)
        if label["primary_theme_label"] not in row["themes"]:
            theme_misses.append(current)
        per_field[row["field"]]["n"] += 1
        per_field[row["field"]]["sentimentCorrect"] += int(label["sentiment_label"] == row["sentiment"])
        per_field[row["field"]]["primaryThemeCovered"] += int(label["primary_theme_label"] in row["themes"])
    scores = {}
    for label in matrix:
        tp = matrix[label][label]
        fp = sum(matrix[a][label] for a in matrix if a != label)
        fn = sum(matrix[label][a] for a in matrix if a != label)
        scores[label] = {"support": sum(matrix[label].values()), "f1": 2*tp/(2*tp+fp+fn) if 2*tp+fp+fn else 0}
    macro = sum(s["f1"] for s in scores.values())/3
    observed = [s["f1"] for s in scores.values() if s["support"]]
    available = macro >= .75
    return {"reviewer": annotations["reviewer"], "reviewType": annotations["review_type"], "sampleSeed": SEED, "n": len(reviews), "sampleDesign": annotations["sample_design"], "threshold": .75, "macroF1": round(macro, 6), "observedClassMacroF1": round(sum(observed)/len(observed), 6), "accuracy": round(1-len(discrepancies)/len(reviews), 6), "perClass": scores, "confusionMatrix": matrix, "perField": dict(per_field), "sentimentAvailable": available, "reason": "VADER does not meet the three-class macro-F1 ≥ 0.75 gate on the fixed semantic review sample; aggregate and aspect sentiment are withheld." if not available else "Threshold met on model-assisted semantic review; independent human validation remains unavailable.", "limitations": ["Codex semantic labels are model-assisted annotations, not human annotations or independent gold-standard validation.", "No neutral examples occur in this fixed sample. Three-class macro-F1 assigns zero to the absent class; observed-class macro-F1 is shown only as a diagnostic.", "Positive framing of proposed improvements can cause lexicon sentiment to reverse the meaning of a complaint.", "Theme dictionary was reviewed against this corpus, including sample text; primary-theme coverage is an in-sample coverage check, not held-out multilabel precision/recall."], "themePrimaryCoverage": round(1-len(theme_misses)/len(reviews), 6), "themeMisses": theme_misses, "discrepancies": discrepancies, "reviews": reviews}


def prepare(source, output):
    dictionary = json.loads((HERE / "theme_dictionary.json").read_text(encoding="utf-8"))
    annotations = json.loads((HERE / "semantic_review_annotations.json").read_text(encoding="utf-8"))
    analyzer = SentimentIntensityAnalyzer()
    workbook = openpyxl.load_workbook(source, read_only=True, data_only=True)
    worksheet = workbook["Sheet1"]
    rows = list(worksheet.values)
    assert len(rows[0]) == 32 and rows[0][21] == "Briefly describe what happened.", "Unexpected questionnaire layout"
    records, pii, skipped = [], Counter(), Counter()
    for idx, cells in enumerate(rows[1:], 1):
        provider = normalized(cells[4])
        assert provider in {"Airtel", "Jio"}, "Unexpected provider"
        for field, col in FIELDS.items():
            original = str(cells[col] or "")
            clean = normalized(original)
            if clean == PLACEHOLDER:
                skipped["incidentPlaceholders"] += 1
                continue
            if field == "incident" and normalized(cells[19]) != "Yes":
                skipped["ineligibleIncident"] += 1
                continue
            if not re.search(r"[a-zA-Z]", clean) or len(clean) < 5:
                skipped["emptyOrNoisy"] += 1
                continue
            text, pii_counts = redact(original)
            pii.update(pii_counts)
            compound = analyzer.polarity_scores(normalized(text))["compound"]
            themes = detect_themes(text, dictionary)
            aspects = []
            for sentence in re.split(r"(?<=[.!?])\s+", normalized(text)):
                sentence_themes = detect_themes(sentence, dictionary)
                if len(sentence_themes) == 1:
                    value = analyzer.polarity_scores(sentence)["compound"]
                    aspects.append({"theme": sentence_themes[0], "text": sentence, "compound": value, "sentiment": classify(value)})
            records.append({"id": f"r{idx:04}", "provider": provider, "field": field, "text": text, "themes": themes, "compound": compound, "sentiment": classify(compound), "aspects": aspects})
    workbook.close()
    rankings = phrase_rankings(records)
    validation = validate(records, annotations)
    counts = {}
    for field in FIELDS:
        group = [r for r in records if r["field"] == field]
        duplicates = Counter(normalized(r["text"]).casefold() for r in group)
        counts[field] = {"usableTexts": len(group), "respondents": len({r["id"] for r in group}), "providers": dict(Counter(r["provider"] for r in group)), "uniqueTexts": len(duplicates), "repeatedTextGroups": sum(c > 1 for c in duplicates.values()), "excessRepeatedTexts": sum(c-1 for c in duplicates.values()), "recordsInRepeatedGroups": sum(c for c in duplicates.values() if c > 1), "unclassified": sum(not r["themes"] for r in group), "themeCounts": dict(Counter(t for r in group for t in r["themes"]))}
    metadata = {"version": VERSION, "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(), "sourceWorksheet": "Sheet1", "sourceRecords": len(rows)-1, "textRecords": len(records), "provenance": "Calculated from the supplied workbook; customer-response origin confirmed by the project owner.", "normalization": "Original response wording preserved after detected-PII redaction; NFKC and whitespace normalization applied only for analysis. Case-folded normalized text defines duplicate groups.", "privacy": {"exportedIdentifiers": "Sequential anonymous worksheet-row key only; no original ID, name, email or language fields.", "scan": "Email syntax and phone-like sequences containing 10–15 digits; name/email columns excluded. A semantic review of 120 texts found no personal names or identifying details. No names were inferred from location phrases.", "redactions": {"emails": pii["emails"], "phones": pii["phones"]}, "limitation": "Pattern scan plus sample review cannot certify complete removal of identifiers in arbitrary free text; this corpus contains no detected matches."}, "excluded": dict(skipped), "counts": counts, "themeDictionary": dictionary, "themePolicy": dictionary["definition"], "sentimentMethod": {"name": "VADER", "positiveThreshold": .05, "negativeThreshold": -.05, "aggregateAvailable": validation["sentimentAvailable"], "explanation": validation["reason"], "questionSeparation": "Sentiment is never pooled across the best-aspect, incident and improvement prompts.", "aspectPolicy": "Only sentences matching exactly one dictionary theme receive an automated aspect score. Other sentences remain unassigned. Aspect sentiment shares the overall validation gate and is not separately validated."}, "phraseMethod": "Contiguous unigrams, bigrams and trigrams; English edge stopwords and observed boilerplate exclusions; minimum document frequency 2; TF=term count/all retained ngrams, IDF=log((1+documents)/(1+document frequency))+1, ranked by mean TF-IDF. Phrase fields on each text retain up to 12 candidates for filtered frequencies.", "phraseRankings": rankings, "validation": validation, "dependencies": {package: importlib.metadata.version(package) for package in ("openpyxl", "vaderSentiment")}, "reproducibility": {"seed": SEED, "transformVersion": VERSION, "scriptSha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), "dictionarySha256": hashlib.sha256((HERE/"theme_dictionary.json").read_bytes()).hexdigest(), "annotationSha256": hashlib.sha256((HERE/"semantic_review_annotations.json").read_bytes()).hexdigest()}}
    output.mkdir(parents=True, exist_ok=True)
    for filename, value in (("text.json", records), ("nlp.json", metadata), ("nlp_validation.json", validation)):
        (output/filename).write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "records": len(records), "counts": counts, "validation": {k: validation[k] for k in ("n", "macroF1", "observedClassMacroF1", "accuracy", "sentimentAvailable", "themePrimaryCoverage")}, "redactions": dict(pii)}, indent=2))


def self_check():
    assert normalized("a\u00a0 b") == "a b"
    assert classify(.05) == "positive" and classify(-.05) == "negative" and classify(0) == "neutral"
    assert redact("Email x@example.com; phone +91 9876543210, 5G 4G and ₹264.")[0] == "Email [email redacted]; phone [phone redacted], 5G 4G and ₹264."
    dictionary = json.loads((HERE / "theme_dictionary.json").read_text(encoding="utf-8"))
    assert detect_themes("App stability and billing", dictionary) == ["billing", "apps"]
    assert "apps" not in detect_themes("I appreciate the network", dictionary)
    assert "call drops" in phrases("The call drops often; call drops disrupt work.")
    print("NLP self-check passed")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path)
    parser.add_argument("--output", type=Path, default=HERE/"output")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.check:
        self_check()
    if args.input:
        prepare(args.input, args.output)
    elif not args.check:
        parser.error("--input is required unless using --check")
