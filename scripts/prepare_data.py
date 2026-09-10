"""Rebuild all publishable data from the unchanged source workbook."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True, type=Path)
    args = parser.parse_args()
    source = args.input.resolve(strict=True)
    project = Path(__file__).resolve().parent.parent
    public = project / 'public' / 'data'
    with tempfile.TemporaryDirectory(prefix='.data-stage-', dir=project) as temporary:
        stage = Path(temporary)
        for script, target in [('prepare_survey.py', 'survey'), ('prepare_text.py', 'nlp')]:
            subprocess.run([sys.executable, str(project / 'scripts' / script), '--input', str(source), '--output', str(stage / target)] + (['--check'] if script == 'prepare_text.py' else []), check=True)
        for name in ['survey.json', 'audit.json', 'metrics.json', 'manifest.json']:
            shutil.copy2(stage / 'survey' / name, public / name)
        for name in ['nlp.json', 'nlp_validation.json']:
            shutil.copy2(stage / 'nlp' / name, public / name)
        shutil.copy2(stage / 'survey' / 'fixtures.json', project / 'tests' / 'fixtures.json')
        fixtures = json.loads((stage / 'survey' / 'fixtures.json').read_text(encoding='utf-8'))
        (project / 'src' / 'data' / 'snapshot.json').write_text(json.dumps(fixtures['segments'][0]['metrics'], separators=(',', ':')), encoding='utf-8')
    print('Rebuilt survey, audit, text assets, reference fixtures and report snapshot.')

if __name__ == '__main__':
    main()
