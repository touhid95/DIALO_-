import json, re
from collections import Counter
from pathlib import Path
from graphify.detect import detect, save_manifest
from graphify.cli import _stamped_manifest_files
from graphify.extract import collect_files, extract
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json, to_html

def main():
    print("1. Running detect...")
    detect_res = detect(Path('.'))
    Path('graphify-out/.graphify_detect.json').write_text(json.dumps(detect_res, ensure_ascii=False, indent=2), encoding="utf-8")

    print("2. Collecting and extracting code AST...")
    code_files = []
    for f in detect_res.get('files', {}).get('code', []):
        p = Path(f)
        code_files.extend(collect_files(p) if p.is_dir() else [p])

    ast_res = extract(code_files, cache_root=Path('.'), parallel=False)
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(ast_res, indent=2, ensure_ascii=False), encoding="utf-8")

    print("3. Merging extraction...")
    sem_path = Path('graphify-out/.graphify_semantic.json')
    if not sem_path.exists():
        sem_path.write_text(json.dumps({'nodes': [], 'edges': [], 'hyperedges': [], 'input_tokens': 0, 'output_tokens': 0}), encoding='utf-8')

    sem = json.loads(sem_path.read_text(encoding="utf-8"))
    seen = {n['id'] for n in ast_res['nodes']}
    merged_nodes = list(ast_res['nodes'])
    for n in sem.get('nodes', []):
        if n['id'] not in seen:
            merged_nodes.append(n)
            seen.add(n['id'])

    merged_edges = ast_res['edges'] + sem.get('edges', [])
    merged_extract = {
        'nodes': merged_nodes,
        'edges': merged_edges,
        'hyperedges': sem.get('hyperedges', []),
        'input_tokens': sem.get('input_tokens', 0),
        'output_tokens': sem.get('output_tokens', 0),
    }
    Path('graphify-out/.graphify_extract.json').write_text(json.dumps(merged_extract, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"4. Building graph with {len(merged_nodes)} nodes, {len(merged_edges)} edges...")
    G = build_from_json(merged_extract, root='.', directed=False)
    communities = cluster(G)
    cohesion = score_all(G, communities)
    gods = god_nodes(G)
    surprises = surprising_connections(G, communities)

    labels = {}
    for cid, nodes in communities.items():
        words = []
        for n in nodes:
            clean_n = re.sub(r'rationale_\d+|py_\w+|main|scrapling', '', n)
            parts = [p for p in re.split(r'[_/.]', clean_n) if len(p) > 2 and not p.isdigit()]
            words.extend(parts)
        c = Counter(words)
        common = [word.capitalize() for word, _ in c.most_common(3)]
        labels[cid] = " ".join(common[:3]) if common else f"Subsystem {cid}"

    questions = suggest_questions(G, communities, labels)

    print("5. Exporting graph.json and GRAPH_REPORT.md...")
    to_json(G, communities, 'graphify-out/graph.json', community_labels=labels)
    tokens = {'input': 0, 'output': 0}
    report = generate(G, communities, cohesion, labels, gods, surprises, detect_res, tokens, '.', suggested_questions=questions)
    Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding="utf-8")

    print("6. Exporting interactive graph.html...")
    to_html(G, communities, 'graphify-out/graph.html', community_labels=labels)

    print("7. Updating manifest...")
    _corpus = detect_res.get('all_files') or detect_res['files']
    _manifest_files = _stamped_manifest_files(_corpus, merged_extract, Path('.'))
    _scan = {f for fl in _corpus.values() for f in fl}
    save_manifest(_manifest_files, root='.', scan_corpus=_scan)

    print(f"DONE! Final Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities.")

if __name__ == '__main__':
    main()
