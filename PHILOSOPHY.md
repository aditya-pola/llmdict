# Philosophy

*A living dictionary for a moving field.*

## What this is

It is a dictionary of the language that has grown up around large language models and the work of training, adapting, and serving them.

## Why this exists

The vocabulary of machine learning has outgrown the places we used to look it up. A modern HuggingFace model card might mention GQA, RoPE, an `int4` quant flavour, a chat template variant, a fine-tuning method, and a serving stack. Each of those is a term someone coined in a paper or a framework changelog, and each carries its own history that the model card assumes you already know.

The reference material that explains those terms is real and good, but it is scattered across paper appendices, blog posts, framework documentation, and the working knowledge of people close to the original conversations. There isn't a quiet, navigable, stable place to look something up, see what is adjacent to it, and leave with the right mental model. That is the gap this tries to sit in.

## A living document

This is meant to be maintained over a long horizon rather than published once and left behind, and the shape of the project follows from that intention. Each term lives in its own small file. The conventions for how to write one are documented and openly discussed. The work of adding or revising an entry is, ideally, only the work of writing it down.

The hope is that the friction of contribution stays low enough for the rate of additions and corrections to keep reasonable pace with the rate at which the field introduces new things to write about.

## Open by design

Contributing happens through a pull request, much like contributing to any open project. Validation runs automatically and reports what to adjust. The writing conventions, including the things that make a card useful at a glance, what belongs on the face, and what belongs in the technical view, are documented in the contributing guide rather than held in the heads of a few maintainers. The rendering code is small enough to read in an evening.

None of this is invented for this project; it borrows from the way open documentation has worked for a long time, and the borrowing is intentional.

## Resists going stale

Any reference like this will eventually be wrong about something. New methods arrive, older ones fall out of use, names get changed in upstream code, and there isn't a way to write an entry today that won't need a correction in a year.

The conviction this project rests on is a modest one. If making a correction is roughly as cheap as noticing an error, corrections will happen often enough to keep the document in a useful, if imperfect, relationship with the field. Whether that conviction holds in practice is largely a question of whether the readers who rely on it are also willing, occasionally, to maintain it.

## Built as a reference

Each surface on the page has one job. The card face is the definition. The expanded view holds the technical detail: formulas, tensor shapes, algorithm steps, original sources. Words inside an entry that name other entries are linked to those entries, the way cross-references work in a printed reference. Search is for direct lookup. The graph view shows how entries relate. The history bar keeps the trail of what has been read.

None of these surfaces try to do more than the one thing they exist for.

## An invitation

If you have looked something up here and felt that an entry could be clearer, or noticed a term that should exist and does not, or have one you know well enough to write down, contributions are warmly welcome. The [contributing guide](CONTRIBUTING.md) explains the format and the conventions, less as requirements than as offers of structure to make the writing easier. Small corrections are valued exactly as much as long technical entries.

The dictionary belongs to the people who use it.
