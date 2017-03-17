## Installation

as usual: `git clone` then `cd vscode-extexpo` then `code .`

## Usage

From VScode (having this repo open), `F5` to "debug-mode" into another VScode instance with the extension loaded.

### GUI interaction demos:
* type `EXPO:` in VScode's command palette

* when offered choices or prompted for input, your pick/input will be printed to the *Output* channel labelled `EXPO`

### Editor interaction demos:

* While loaded, this extension hijacks the `markdown` format for its demos, so best just play with temp files, otherwise might wanna disable Auto-Save -- though VScode's Undo/Redo seems entirely robust anyway.

* Functionality is, for demo purposes, implemented in technically pointless ways: "format" inserts a line-break for every white-space.. just went for whatever most-simplistic routine showcases the essentials in each case

* Some functionality only "works" on words containing `expo` (*Go to Definition* and such)
