# LaTeX Template Generator

This utility generates LaTeX templates for my CS and math assignments. It asks a series of questions in a CLI and uses
the answers with EJS to fill out a LaTeX template faster than I could by hand. The main template is stored in
`template.tex`, and the CLI logic is stored in `index.js`.

To get the utility to work, you must create a `.env` file in the root of the project. Make a copy of `.env.example` and
rename it to get started. Add your name, a list of your classes, and a list of your common collaborators.
