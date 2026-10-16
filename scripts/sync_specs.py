import json
import os

state_path = "web/src/data/tobi-state.json"
with open(state_path, "r", encoding="utf-8") as f:
    state = json.load(f)

for s in state.get("specs", []):
    spec_file = os.path.join("specs", s["name"])
    if os.path.exists(spec_file):
        with open(spec_file, "r", encoding="utf-8") as sf:
            s["code"] = sf.read()
            print(f"Synced {s['name']} ({len(s['code'])} bytes)")

with open(state_path, "w", encoding="utf-8") as f:
    json.dump(state, f, indent=2, ensure_ascii=False)

print("Specs synchronized successfully!")
