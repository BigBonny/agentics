# Design review: Agentics vs Duolingo and Brilliant

Date: 2026-11-22. Scope: the three home pages, at 1280 px wide.

## How this was measured

I opened duolingo.com (French version) and brilliant.org in a browser, took
screenshots down each page, and read the computed styles of their headings,
body text and buttons. I then ran the same measurements on the Agentics home
page as it stands in the working tree (the uncommitted redesign from earlier
today).

Limits of the evidence:

- Home pages only. I did not open their sign-up flows or lesson screens.
- One width (1280 px). Their mobile layouts were not measured.
- Brilliant's lower sections reveal on scroll and did not paint in my
  screenshots. For those sections I have their text and style values, not
  pictures.
- "Colours in use" is a count of distinct computed colour values on text and
  backgrounds. It is a rough proxy, not a design-token audit.

## Verdict

The Agentics home page copies the surface of these two sites and misses what
makes them work. It took Duolingo's raised button and Brilliant's off-white
background and floating nav bar. It did not take the three things both sites
are built on:

1. A picture of the product or a character on every screen.
2. A palette you can count on one hand.
3. One idea per screen, said in a few words.

Agentics has no images at all, about 40 colour values, and a first screen that
holds 171 words. The result reads as a well-made template, not as a brand.
This applies to my own redesign from earlier today as much as to the version
before it.

## The numbers

| | Duolingo | Brilliant | Agentics |
|---|---|---|---|
| Images on the page | 20 | 44, plus 2 video/canvas elements | **0** |
| Icons from a stock set | none seen | none seen | **42** (Lucide) |
| Typeface | custom (`duolingo-sans`, `feather`) | custom (`CoFo Robert` serif + `CoFo Brilliant`) | Google fonts (Bricolage Grotesque + Inter) |
| Main headline | 32 px, weight 700, grey `#4b4b4b` | 54 px, weight 500, black | **68 px, weight 800**, near-black |
| Body text | 17 px, grey `#777` | 16 px, black at 60% | 20 px in the hero, but **14 px is the most common size** (85 elements) |
| Distinct text sizes | few | few | **12** |
| Distinct colour values | about 12, of which 2 are brand colours (green, blue) | about 12, almost all black, white and grey; one green button | **42**, with 6 accent hues in use at once |
| Words on the first screen | about 15 | about 30 | **171** |
| Main button | 12 px corners, 15 px uppercase text, 4 px solid lower edge, no blur | full pill, 16 px text, flat | 16 px corners, 18 px text, 5 px solid lower edge **plus** a blurred glow |
| Bordered, shadowed cards | none on the home page | few | **10** |
| Page length | 8000 px | 8279 px | 5193 px |
| Typical section | 530 px, one idea | one idea with one product visual | 1483 px and 1687 px, each holding 4 to 6 boxes |

## Findings, most damaging first

### 1. There is nothing to look at

Duolingo's first screen is half illustration: the owl and a crowd of
characters. Every section below it pairs two sentences with one drawing.
Brilliant's first screen ends in a fan of seven real lesson screens, and its
tutor character, Koji, appears right after.

Agentics has zero images. In their place it has 42 stock icons, each sitting
in a tinted square. Stock icons in tinted squares are the most recognisable
mark of a template site. No amount of animation fixes this, because there is
no subject to animate.

The small charts in the features grid make it worse. "16/20", "Dérivées 86%"
and the progress curve are numbers I invented. They are drawings of a product,
not the product. Brilliant shows real screens.

### 2. Too many colours, used as decoration

Brilliant is black, white, three greys and one green button. Duolingo is
white, two greys, one green and one blue. In both, colour means something:
green is "go".

Agentics uses violet, yellow, mint green, coral, sky blue, amber and orange on
one page. It also has gradient text, a yellow highlighter stroke, a dot grid
and two blurred colour patches behind the hero. None of these carry meaning.
They fill the space where pictures should be.

### 3. The headline shouts and says nothing specific

At 68 px and weight 800, the Agentics headline is the largest and heaviest of
the three. Duolingo's is 32 px. Brilliant's is 54 px at medium weight. Both
can afford quiet type because the picture does the work.

The words are the larger problem:

- Agentics: "Maîtrisez vos examens avec l'IA". Above it: "L'apprentissage de
  demain, aujourd'hui". Further down: "Tout ce dont vous avez besoin pour
  réussir".
- Duolingo: "gratuit. fun. efficace."
- Brilliant: "A visual, interactive tutor, not a cheating machine".

The Agentics lines could sit on any education site. They never say who the
site is for. The course catalogue shows the real audience: BTS students (CIEL,
MCO and others) following a set programme with named subjects. The page does
not use the word "BTS" once. It leads with "IA", which is the tool, where both
competitors lead with what the learner gets.

### 4. The first screen tries to do eight jobs

Duolingo's first screen has a headline, two buttons and a picture. Brilliant's
has a headline, one sentence and two buttons.

The Agentics first screen has: a label pill, the headline, a paragraph, two
buttons, three trust items, a four-answer quiz, two floating badges and a
scrolling strip of subjects. A visitor cannot tell which one matters.

### 5. Everything is in a box

Neither site puts its features in bordered cards with shadows. They place text
and a picture on a flat background and let space separate them.

Agentics has 10 rounded, bordered, shadowed cards. The features section is a
grid of six boxes of equal weight. Equal weight means no feature stands out,
and the layout looks like every other SaaS landing page from the last three
years.

### 6. The buttons mix two styles

Duolingo's button has a solid lower edge and nothing else. Brilliant's is a
flat pill. Each site picked one idea.

The Agentics button has the solid lower edge and also a blurred purple glow
under it. Those are two different lighting models on one object. The site also
has four button styles (violet, yellow, white, outlined-on-dark) on one page.

### 7. Seven button labels, two destinations

The buttons read: "Commencer Gratuitement", "Essai Gratuit", "Essayer un Quiz
Gratuit", "Passer à Premium", "Essai Gratuit de 30 Jours", "Faire un Quiz
Gratuit", "Tester mon niveau gratuitement". They go to two places: the pricing
page and the guest quiz.

"Commencer Gratuitement" opens the pricing page. That is a broken promise on
the main button. Duolingo repeats one label, "C'est parti !", from top to
bottom.

### 8. No proof

Brilliant shows an accreditation, a privacy certification, "100,000+
five-star app reviews", "5,000 schools" and five named testimonials.

Agentics shows none. Earlier today I removed "plus de 10 000 étudiants"
because nothing in the project backs it. What remains is also unbacked as far
as I can tell: "30 jours satisfait ou remboursé", "Offre spéciale", and
"certificats pour valoriser vos compétences auprès des employeurs". If these
are not true, they are a legal risk, not a design detail.

### 9. The paywall arrives before the value

Four of the six feature boxes carry a "Premium" badge. The visitor learns what
is locked before learning what the product does. Neither competitor mentions
paid plans in its feature list. Duolingo keeps its paid plan in one dark
section near the end.

### 10. Motion with no subject

Duolingo animates its characters. Brilliant animates its lesson screens (32
running animations and two video or canvas elements on load).

Agentics fades and slides every block up by the same distance, and two badges
bob up and down. That is generic scroll animation. The one piece of motion
that means something is the quiz in the hero, where an answer turns green or
shakes.

### 11. Smaller issues

- **Navigation.** Agentics shows five links and two actions. Duolingo shows a
  logo and a language picker. Brilliant shows a logo and "Sign in". Both add
  their main button only after you scroll.
- **Capital letters.** "Quiz IA Adaptatifs", "Commencer Gratuitement",
  "Analyse des Faiblesses" follow English title case. French uses a capital on
  the first word only. Duolingo's French page does this correctly.
- **Small text.** 14 px is the most common size on the page. Both competitors
  keep reading text at 16 to 17 px.
- **Two designs on one site.** The pricing, guest quiz, courses and dashboard
  pages still use the older blue-violet gradient look. Clicking any button on
  the home page lands on a page that looks like a different product.
- **Stacked dark blocks.** The closing banner and the footer are both dark and
  sit one after the other.

## What the Agentics page has that the others do not

Stated after the critique, and with a caveat.

A visitor can answer a real question on the first screen, with an explanation,
without signing up. I did not see a playable question on either competitor's
home page. This is the only element on the page that is specific to the
product. The caveat: I only looked at their home pages, and both let you try a
lesson one click later.

It is currently buried among seven other things. That is the main argument for
finding 4.

## What to change, in order

1. **Get real visuals.** Take screenshots of the actual quiz, the correction
   screen and the dashboard, and use them in place of the invented charts.
   This costs an afternoon and removes findings 1 and part of 10.
2. **Cut the palette to violet, one accent, and neutrals.** Remove gradient
   text, the dot grid, the colour patches and the per-feature icon colours.
   Keep green and red only for right and wrong answers, where they mean
   something.
3. **Rewrite the first screen around the quiz.** Headline, one line, the quiz.
   Move the trust items, floating badges and subject strip out. Drop the
   headline to about 48 to 56 px and weight 700.
4. **Name the audience.** Say "BTS" and name real subjects from the catalogue
   in the headline or the line under it.
5. **One main button label, one destination.** The main button should start
   the free quiz. Pricing gets a plain link.
6. **Replace the six-box grid with three or four full-width sections.** Each
   one: two sentences and one screenshot, alternating sides.
7. **Fix the button.** Remove the blurred glow. Keep the solid edge. Reduce to
   two styles: filled and outlined.
8. **Remove or prove every claim.** Refund guarantee, special offer,
   employer-recognised certificates.
9. **Move "Premium" off the feature list** and into one section near the end.
10. **Bring pricing, guest quiz and courses pages into the same style.**
11. **Decide on a character or illustration style.** This is the largest gap
    and the most expensive to close. See the counter-arguments first.

Steps 2 to 9 are code and copy changes I can make. Step 1 needs a working
login to capture screens (the local Clerk key is a placeholder). Step 11 needs
a decision and probably an illustrator.

## Decision on audience (added after the review)

The owner's answer: both. Schools come first, as partners who enrol their
students. Later, students should be able to find and choose the site on their
own.

What this changes:

- **The home page needs two doors, and today it has one.** Every button leads
  to a student plan at 19 € a month or to the guest quiz. A training manager
  has nowhere to go. Brilliant handles the same split on its first screen with
  two buttons ("I'm a learner" / "I'm a parent or teacher") and a later
  section, "Trusted by more than 5,000 schools", with its own link.
- **The page stays student-facing.** A school judges the product by what its
  students will see, and the self-serve phase needs this page anyway. So the
  first screen keeps the quiz, and the second button becomes the school door.
- **Schools need a different destination.** Not the pricing page. A short
  schools page (what the school gets, how the catalogue is imported from its
  own system, how progress is reported) ending in a contact or demo request.
- **Proof becomes the first job, not the eighth.** A school will not sign on
  adjectives. One named partner school, with its logo and one sentence from a
  teacher, is worth more than every visual change in this document. Until one
  exists, the honest substitute is the real catalogue: the actual BTS
  programmes and subjects already loaded.
- **The logged-in screens move up.** In the schools phase most students arrive
  already enrolled and never see the home page. The dashboard, quiz and course
  pages are what they and their teachers judge. Step 10 below moves from
  near-last to right after the first screen.

Revised order: step 8 (remove or prove claims), a new schools door and schools
page, steps 3 to 5 (first screen, audience named, one student button), step 10
(inner pages), then 2, 6, 7, 9, and 1 and 11 when a login and a budget exist.

## Counter-arguments worth weighing

**"We cannot afford a mascot or a custom typeface."** True, and copying
Duolingo's owl would look like a knock-off anyway. Brilliant is the more
useful model here: most of its visual weight comes from screenshots of real
lessons, which cost nothing. A mascot is optional. Real product pictures are
not.

**"Our students are enrolled by their school. They do not choose us from a
home page."** If that is the case, this whole comparison is aimed at the wrong
page. The catalogue comes from a school management system, which suggests the
buyers are schools and the users are assigned. Then the dashboard and quiz
screens deserve the effort, and the home page should speak to a training
manager, not a student. Answered since: both, schools first. See "Decision on
audience" above.

**"Duolingo can be minimal because everyone knows it. An unknown product has
to explain more."** Partly right. But Brilliant explains a great deal and does
it with one picture and two sentences per section, not with more boxes on the
first screen. More explanation is fine. More simultaneous explanation is not.

**"The comparison is unfair: they have design teams."** It is. The useful
question is which of their choices are cheap. Fewer colours, fewer words, one
button label and sentence-case French cost nothing. Those are steps 2, 3, 5
and part of 11 above.

## A note on this review

`/egm:egm-review` runs a set of independent reviewers over a written design
document. There was no design document to review, so this file is a direct
comparison written from the browser evidence. If you want the independent
reviewer pass, this file can be the input: run
`/egm:egm-review docs/design-review-duolingo-brilliant.md`.

## Status after the first build pass (2026-11-22)

Done in the working tree, not committed:

- **Claims.** Removed the refund guarantee, "special offer" and
  employer-certificate lines from the home page. On the pricing page, removed
  the 30-day trial badge, the trial FAQ entry and the refund line, and renamed
  "Commencer mon essai gratuit" to "Passer à Premium": the Stripe checkout has
  no trial period configured, so the page was promising something the code
  does not do.
- **Two doors.** The first screen now has one student button ("Commencer un
  quiz gratuit", to the guest quiz) and one school link ("Je représente un
  établissement", to a new `/ecoles` page). `/ecoles` is added to the public
  routes in `middleware.ts`.
- **First screen.** Headline names BTS, 54 px at weight 700 (was 68 px at
  800). About 80 words including the quiz (was 171).
- **Features.** The six-box grid and the four-step path are replaced by three
  full-width sections. "Premium" appears once, in a closing band.
- **Palette and buttons.** Gradient text, the dot grid, colour patches and the
  yellow button are gone. Distinct colour values on the home page: 24 (was
  42). Stock icons: 14 (was 42). The button keeps the solid lower edge and
  loses the glow.
- **Inner pages.** Gradients and blurred patches flattened to the same palette
  on pricing, guest quiz, courses, subjects, dashboard, account, sign-in and
  sign-up.

Still open:

- The three feature visuals are drawn examples, labelled "Exemple". Real
  screenshots need a working login.
- Images on the home page: still 0.
- Dashboard, account and the full quiz were changed by script and compile, but
  were not looked at in a browser (they need a login).
- Title case remains in many inner-page strings.
- No partner school is named anywhere.
