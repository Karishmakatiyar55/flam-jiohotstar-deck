#!/usr/bin/env python3
"""Builds the single self-contained index.html from src/ and assets/."""
import base64, pathlib
root = pathlib.Path(__file__).resolve().parent
def b64(name, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode((root / "assets" / name).read_bytes()).decode())
html = (root / "src" / "index.src.html").read_text(encoding="utf8")
html = html.replace("/*{{CSS}}*/", (root / "src" / "deck.css").read_text(encoding="utf8"))
html = html.replace("/*{{JS}}*/", (root / "src" / "deck.js").read_text(encoding="utf8"))
html = html.replace("{{FLAM}}", b64("flam_logo.png", "image/png"))
html = html.replace("{{JH}}", b64("jh_logo_alpha.png", "image/png"))
html = html.replace("{{WAVE}}", b64("wave.jpg", "image/jpeg"))
assert "{{" not in html.split("<script>")[0], "unfilled placeholder"
(root / "index.html").write_text(html, encoding="utf8")
print("index.html", len(html) // 1024, "KB")
