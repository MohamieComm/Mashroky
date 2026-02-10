#!/usr/bin/env node
/*
	tools/fix-mojibake.js

	Scans repository files for mojibake replacement characters ( / \uFFFD)
	and writes a JSON report to `tools/mojibake-report.json`.

	Usage:
		node tools/fix-mojibake.js            # scan and write report
		node tools/fix-mojibake.js --dry-run  # print summary to console only
		node tools/fix-mojibake.js --fix --mapping=path/to/mapping.json

	Mapping format (JSON): { "": "رحلة", "": "‌" }

	The script is conservative: automatic fixes only applied when --fix
	and --mapping are provided. Originals are backed up with `.bak`.
*/

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const reportPath = path.join(__dirname, "mojibake-report.json");

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const doFix = argv.includes("--fix");
const mappingArg = argv.find((a) => a.startsWith("--mapping="));
const mappingPath = mappingArg ? mappingArg.split("=")[1] : null;

const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".html", ".css", ".txt"]);
const mojibakeRegex = /[\uFFFD]|[ÃâØÙ]/;

function walk(dir) {
	const results = [];
	const list = fs.readdirSync(dir, { withFileTypes: true });
	for (const ent of list) {
		if (ent.name === "node_modules" || ent.name === ".git" || ent.name === "build" || ent.name === "dist") continue;
		const full = path.join(dir, ent.name);
		if (ent.isDirectory()) {
			results.push(...walk(full));
		} else if (exts.has(path.extname(ent.name))) {
			results.push(full);
		}
	}
	return results;
}

function findMojibakeInFile(filePath) {
	const content = fs.readFileSync(filePath, "utf8");
	const lines = content.split(/\r?\n/);
	const occurrences = [];
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (mojibakeRegex.test(line)) {
			occurrences.push({ line: i + 1, text: line });
		}
	}
	return occurrences;
}

function loadMapping(p) {
	try {
		const raw = fs.readFileSync(p, "utf8");
		return JSON.parse(raw);
	} catch (err) {
		console.error("Failed to read mapping:", err.message);
		return null;
	}
}

function applyMappingToContent(content, mapping) {
	let out = content;
	for (const [k, v] of Object.entries(mapping)) {
		// escape special regex chars in k
		const pattern = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		out = out.split(pattern).join(v);
	}
	return out;
}

function main() {
	console.log("Scanning for mojibake characters in repo...");
	const files = walk(root);
	const report = [];
	for (const file of files) {
		try {
			const occ = findMojibakeInFile(file);
			if (occ.length) {
				report.push({ file: path.relative(root, file), occurrences: occ });
			}
		} catch (err) {
			// ignore binary/encoding issues
		}
	}

	fs.writeFileSync(reportPath, JSON.stringify({ scannedAt: new Date().toISOString(), results: report }, null, 2), "utf8");
	console.log(`Report written to ${reportPath} — found ${report.length} files with mojibake.`);

	if (dryRun) {
		console.log("Dry run; not applying fixes.");
		return;
	}

	if (doFix) {
		if (!mappingPath) {
			console.error("--fix requires --mapping=path/to/mapping.json");
			process.exit(2);
		}
		const mapping = loadMapping(mappingPath);
		if (!mapping) process.exit(2);

		let changedFiles = 0;
		for (const item of report) {
			const file = path.join(root, item.file);
			let content = fs.readFileSync(file, "utf8");
			const newContent = applyMappingToContent(content, mapping);
			if (newContent !== content) {
				// backup original
				fs.copyFileSync(file, file + ".bak");
				fs.writeFileSync(file, newContent, "utf8");
				changedFiles++;
				console.log(`Patched ${item.file} (backup at ${item.file}.bak)`);
			}
		}
		console.log(`Applied mapping to ${changedFiles} files.`);
	}
}

main();
