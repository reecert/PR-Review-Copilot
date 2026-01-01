
import { parsePatch, getSnippetByRange } from "../lib/diff";

const complexPatch = `@@ -1,3 +1,4 @@
 import React from 'react';
 import { useState } from 'react';
+import { useEffect } from 'react';
 
 export function App() {
@@ -10,7 +11,7 @@
   return (
-    <div>
+    <div className="app">
       <h1>Hello</h1>
     </div>
   );
`;

const newFilePatch = `@@ -0,0 +1,5 @@
+console.log("New file");
+console.log("Line 2");
+console.log("Line 3");
+console.log("Line 4");
+console.log("Line 5");
`;

function testDiff() {
    console.log("Testing Complex Patch...");
    const parsed = parsePatch(complexPatch);

    // Test 1: Check added line numbering
    // Line 3 in new file is "import { useEffect } from 'react';"
    // In patch, it's the 4th line (index 3).
    // Let's check our parsed output.
    const addedImport = parsed.hunks.find(l => l.content.includes("useEffect"));
    console.log("New Import Line:", addedImport?.newLineNumber === 3 ? "PASS" : `FAIL (${addedImport?.newLineNumber})`);

    // Test 2: Check modified line
    // -    <div> (Old 11)
    // +    <div className="app"> (New 12)
    // Context between them? No, they are adjacent.
    // Wait, in my patch string:
    //   return (
    // -    <div>
    // +    <div className="app">
    //       <h1>Hello</h1>

    // "return (" is context.
    const divLine = parsed.hunks.find(l => l.content.includes('className="app"'));
    console.log("Modified Div Line:", divLine?.newLineNumber === 12 ? "PASS" : `FAIL (${divLine?.newLineNumber})`);

    // Test 3: Get snippet for the Import
    const snippet = getSnippetByRange(parsed, 3, 3);
    console.log("Snippet (L3-L3):", snippet?.trim() === "import { useEffect } from 'react';" ? "PASS" : `FAIL: ${snippet}`);

    console.log("\nTesting New File Patch...");
    const parsedNew = parsePatch(newFilePatch);
    const line5 = parsedNew.hunks.find(l => l.content.includes("Line 5"));
    console.log("Line 5 Number:", line5?.newLineNumber === 5 ? "PASS" : `FAIL (${line5?.newLineNumber})`);
}

testDiff();
