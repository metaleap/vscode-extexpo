## Installation

The usual: `git clone` then `cd vscode-extexpo` then `code .`

## Usage

From VScode (having this repo open), `F5` to "debug-mode" into a new VScode instance with the extension loaded.

### GUI interaction demos:

(Code for this in `src/ext-expo.ts`)

* type `EXPO:` in VScode's command palette for these demos

* when offered choices or prompted for input, your pick/input will be printed to the *Output* channel labelled `EXPO`

### Editor interaction demos:

(Code for this in `src/md-hijack.ts`)

While active, the extension hijacks the `markdown` format for these demos:

* **Hover**: hover over a word and a quip using it appears in a tool-tip

* **Code Actions**: a light-bulb in the glyph-margin that offers to replace all current selections with (or if none, insert in all cursor locations) the word `EXPO`

* **Code Lens**: is placed just before the first line of the current `markdown` editor, invokes the same code action as above

* **Auto Complete**: lists all `vscode.CompletionItemKind` `enum` members with their respective icons

* **Go to Definition / Peek Definition**: for all words *containing* the sub-string `expo` (any case), just jumps to `vscode-extexpo` in the same listing also generated via the `EXPO: extensions.all` palette command

* **Go to Implementation**: same functionality as above for this demo

* **Go to Type Declaration**: same functionality as above for this demo

* **Highlights**: ensures all words containing the sub-string `expo` (any case) will be highlighted in `markdown` documents

* **Links**: similar to the out-of-box `http://` / etc. clickable-links, here we ensure all words containing the sub-string `expo://` (any case) will invoke the same jump as our above *Go to Definition*

* **Format Document** / **Format Selection**: for the current document / selection, replaces every space with a new-line

* **Go to Symbol in File**: usually `Ctrl+Shift+O`, this contributes all the document's "words" (*naively*, ie. just split-by-space) to jump to

* **Go to Symbol in Workspace**: usually `Ctrl+T` -- contributes (not just in `markdown` but *any* editor while this extension is loaded) all `vscode.SymbolKind` `enum` members with their respective icons, each jumping to the same location as *Go to Definition* above

* **Find All References**: same as *Peek Definition* above, but for any word

* **Rename Symbol**: case-sensitive word (not per se sub-string) renaming

* **Signature Help**: a tool-tip that pops up whenever a `$` or ` ` (space) character is typed
