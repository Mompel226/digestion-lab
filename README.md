<div align="center">

<h1>🍽️ &nbsp;Digestion Lab</h1>

**Cambridge IGCSE Biology 0610 · Topic 7 — Human nutrition**

[![Open the lab](https://img.shields.io/badge/▶_Open_the_lab-0969DA?style=for-the-badge&logoColor=white)](https://nlcsbiology.com/digestion-lab/)

![14 stations](https://img.shields.io/badge/14-stations-3D7A54)
![123 questions](https://img.shields.io/badge/123-questions-8F5D09)
![Marks itself](https://img.shields.io/badge/questions-mark_themselves-0B6A8C)
![No sign-up](https://img.shields.io/badge/students-no_sign--up_needed-6FA287)

by **Dr Daniel Mompel Riera** · NLCS Jeju

</div>

![The Digestion Lab: the alimentary canal on the left, a station open on the right](docs/img/screen.jpg)

---

## What a student does

Click any organ on the canal and work through that station: what the exam wants, what it
actually looks like, and questions that say right or wrong — never the answer. Or send a meal
down the whole canal and stop at each organ in turn.

|  |  |
|---|---|
| 🫃 **14 stations** | diet · the canal · mouth and teeth · salivary glands · epiglottis · oesophagus · stomach · liver and gall bladder · pancreas · small intestine · large intestine · rectum and anus · molecules and enzymes · the practicals |
| ✍️ **123 questions** | fill the gaps · drag & drop · multiple choice · put in order · match up · sort into groups · set the pH |
| 🔬 **Real pictures** | dissections, micrographs and photographs, not diagrams of diagrams |
| 🧪 **A practical you run** | the visking tubing experiment — nothing happens unless you act |
| 📖 **A shared glossary** | one wording per term, the same in every lab |

> [!NOTE]
> **The answers are not in the page — at all.** The lab can tell a student they are wrong, but
> nothing in it knows what *right* is. There is no setting that reveals the answers, because
> there is nothing to reveal. How that works is explained below.

## Where it sits

One of the labs behind the [Human Body Hub](https://nlcsbiology.com/human-body-hub/), which
is one shelf of the [Biology Hub](https://nlcsbiology.com/biology-hub/) — the front door to
every Biology app here. The **← All labs** button goes back up.

> [!TIP]
> **Want your students' scores in a spreadsheet of your own?**
> Set it up once, for every lab at the same time:
> **[Would you like to see how your students are doing?](https://github.com/Mompel226/biology-hub#-would-you-like-to-see-how-your-students-are-doing)**

<details>
<summary><b>Behind the scenes</b> — how this lab works, in plain English</summary>

<br>

**The drawing you click.** The alimentary canal is not a picture — it is a drawing the page can
move around in, so when you choose an organ the view travels to it and settles, and small
animations play where they help. It is the same drawing at every size, so it stays sharp on a
phone and on a projector.

**Why the answers are not in the page.** This is the part worth understanding.

Anything a web page can show, a student can find by digging around in it. So the answers are
never sent to the student at all. Instead, each question carries a *scrambled fingerprint* of
its answer. When a student answers, the page scrambles what they typed in exactly the same way
and compares the two fingerprints. The same answer always makes the same fingerprint, so a match
means they were right.

The trick is that scrambling only works one way. You cannot start from a fingerprint and work
back to the answer — so nothing in the page, and nothing a student can dig out of it, can say
what the right answer is. The lab can only ever tell them *not that one*.

The real answers live in one file on my own computer, which is never published. That is also
why nobody else can rebuild this lab's questions, even if they copy everything else.

**What is shared with the other labs.** The part that draws a question, handles the dragging and
does the marking is identical in every lab, so it is kept in one place and copied in whenever a
lab is rebuilt. Fix something once and every lab gets the fix. The glossary works the same way —
one wording per term, everywhere, so *emulsification* never means two things.

What belongs to this lab alone is its content: the 14 stations, the 123 questions, and the
photographs.

**Rebuilding it** (only needed if you change the content). One command reads the master file
with the answers in it and writes out the published version with only the fingerprints. It
refuses to finish unless every single answer still marks correctly — so a mistake in the
content stops the lab being published rather than reaching a student.

```
node tools/build.mjs
```

**Copying it for your own school.** Everything the page needs is in this repository, so a copy
runs straight away. What you cannot do is change the questions, because the file with the
answers was never published. If you just want to use the lab with your classes, you do not need
a copy at all — send your students the link.

Photograph credits: [`assets/photos/CREDITS.md`](assets/photos/CREDITS.md).

</details>

Made by **Dr Daniel Mompel Riera** · Biology, NLCS Jeju ·
[dmompelriera@nlcsjeju.kr](mailto:dmompelriera@nlcsjeju.kr)
