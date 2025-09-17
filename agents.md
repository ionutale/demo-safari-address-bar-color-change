build this example 
Sidebar menu

Write

Ion Utale
Home
Library
Profile
Stories
Stats
Following
Bootcamp
Bootcamp
Wrangler
Wrangler
Andrew Zuo
Andrew Zuo
The Evil Geek
The Evil Geek
George Malamidis
George Malamidis
David Fekke
David Fekke
Mark Ellis
Mark Ellis
Kai Waehner
Kai Waehner
David Graham
David Graham
Dmitry Yarygin
Dmitry Yarygin
Get unlimited access to the best of Medium for less than $1/week.
Become a member


evan kirkiles
 highlighted
Coloring the WebKit Browser Bars
A few tips for vastly improving the appearance of your website for mobile (and some desktop) WebKit end-users.

evan kirkiles
evan kirkiles

Follow
9 min read
·
Jun 7, 2023
120

3




In a recent effort to redesign my personal website, I opted for a high-contrast two-column layout. The first column’s background I chose to be white, and the second column’s background would be black, with the two columns collapsing vertically on smaller devices. The background-color of the body of my document’s body is a plain white, which will be important later. It’s a simple design:
Press enter or click to view image in full size

The desktop display of my website in Safari’s light mode, compact view.
Yet as soon as I visited the site on XCode’s mobile device simulator to view how it would appear on mobile iPhone devices, I immediately noticed something that didn’t quite fit my vision. After scrolling down into the “Gallery” section of the landing page, where I opt for white text on a black background, I was left with two visually jarring white bars on the top and bottom of the viewport.
Press enter or click to view image in full size

Left: Initial View, Right: Scrolled View
Clearly, I want the status and navigation bars to fit the black background color of the second column of the page. Yet at the same time, I’d like them to be white while the first column is still in view. So how do we do that?
Through the rest of this article, I’ll run through the quirks that exist in WebKit’s coloring of these native elements, and hopefully help you elevate the appearance of your own website, dynamically, allowing a more native feel on WebKit devices.
A Native Look and Feel
On mobile browsers, your actual site only takes up around 85–90% of the screen. At any point in time, that other 10–15% of the screen is occupied by a native navigation bar (where the website’s URL lives) and status bar (where the notch and battery lives). The color of these bars in Safari / WebKit, unlike Chromium, is directly settable. However, where they inherit their styles from is a bit nebulous, and can be confusing at first.
The Status Bar (“theme-color” meta tag)
The color of the top status bar follows the below hierarchy, in order of precedence:
The theme-color meta tag in your HTML’s head, e.g. <meta name="theme-color" content="#f0f0f0"> . This also responds to JavaScript updates if you set it manually.
The theme-color specified in your manifest.json , which is specifically targeted for PWAs. As this file is not dynamic, i.e. it is only loaded by your browser once, this is the least flexible option and I often forgo it, removing the setting from my manifest.json.
Lastly, your document’s body’s background-color in CSS. Using background-color also enables CSS transitions. However, there is a caveat in using background-color, which will come up when I go over the navigation bar’s style hierarchy.
For example, by setting the theme-color meta tag to a value of #000000 , we can achieve the following results:
Press enter or click to view image in full size

Coloration of the status bar by setting the meta “theme-color” tag
That looks a lot better for the top status bar—and of course, we can add a bit of JavaScript to update the theme-color meta tag to the black when we scroll down the page…
// A simplification of a scroll-based theme-color changer
window.addEventListener('scroll', () => {
  const metaTag = document.querySelector('meta[name="theme-color"]');
  if (window.scrollY / window.innerHeight > 0.8) {
    metaTag.setAttribute("content", "#000000");
  } else {
    metaTag.setAttribute("content", "#ffffff");
  }
}, false);
…allowing it to start out as white at the top and jump to black when we hit the “Gallery” sticky bar. But the lower, minimized navigation bar doesn’t change color at all. To understand why, let’s go over that bar’s style inheritance hierarchy.
The Navigation Bar (“background-color” CSS property)
The navigation bar actually inherits its color from a single place: the background-color on the document body. Now, remember that the status bar can also inherit its color from the body background-color . This means that we can easily synchronize the two by removing (a) the theme-color meta tag and (b) the theme-color setting in our manifest.json , and instead set the background-color of the body to #000000:
Press enter or click to view image in full size

Tada! A much nicer experience for the Gallery section.
Let’s also port over our scroll-based JavaScript code to update our document’s body’s background color instead of the now-removed meta theme-color tag—
// A simplification of a scroll-based background color changer
window.addEventListener('scroll', () => {
  if (window.scrollY / window.innerHeight > 0.8) {
    document.body.style.backgroundColor = "#000000";
  } else {
    document.body.style.backgroundColor = "#ffffff";
  }
}, false);
—giving us the desired ambient effect of white at first, and then black in the gallery. Our method also supports smooth CSS transitions! As of now, this already looks great…

…but we can do even better.
The Break Up
Our working solution looks good in the screenshots provided, but in the brief transitory scroll position where the top part of the screen has one main color and the bottom half has another, the bars still leave something to be desired:
Press enter or click to view image in full size

Notice the white minimized navigation bar. Not perfect!
Notice the white navigation bar on the black background in the lower portion of the screen. Given that the two bars inherit styles from different hierarchies, we could hypothetically break up their coloration—having the lower navigation bar always match the specified color of the element in the bottom of the screen, and having the upper status bar always match the color of the element at the top of the screen.
Implementing Independent Bar Colors
So let’s think. The lower navigation bar needs to use the background-color CSS property. Thus, if we use the theme-color meta tag to control the color of the status bar, we can effectively separate the coloring of the two elements and control them dynamically. Yet here’s where it gets sticky, for two reasons.
For whatever purpose, the color of the minimized navigation bar actually only updates and reads from the background-color CSS property when (a) the user scrolls and goes from a maximized to a minimized navigation bar, or (b) when the color of the status bar changes. This means that if we’re decoupling the status bar’s color from the navigation bar by using the meta theme-color tag, changing the color of the background-color CSS property isn’t enough to trigger a repaint of the navigation bar—we need to get the status bar to repaint as well. And as the colors are diff’d to determine when the status bar needs to repaint, this means we need to change the theme-color to a different color.
Further, because we are now controlling the status bar’s color with the HTML theme-color meta tag, we don’t have access to a smooth CSS transition for its color—we’ll need to tween between the two colors manually, using JavaScript. And because the navigation bar’s color only updates when the status bar repaints, that also rules out CSS-based color transitions for the navigation bar unless it is synced with the status bar. You’ll notice if you set a transition on the background-color of the body, when you change the status bar’s color, the navigation bar samples the interpolated background-color value at the current point in time, not all throughout.
All that being said, it is still possible to decouple the two native browser bars. To detect when each bar needs to update, I opted to use two IntersectionObservers—one for the top of the screen and one for the bottom of the screen:
// Note this is all React code wrapped in UseEffects

// Grabbing references to the current color and the meta tag
metaTag.current = document.querySelector('meta[name="theme-color"]');
currThemeColor.current = metaTag.current?.getAttribute('content') ?? null;

// ....

// The top-of-screen intersection observer only sets the theme-color
const observerTop = new IntersectionObserver(
  (es) => {
    if (!metaTag.current) return;
    const selectedEntry = es.filter((e) => e.isIntersecting);
    const target = selectedEntry[0]?.target;
    if (!target) return;
    const color = target.getAttribute('data-metathemeswap-color');
    if (!color) return;
    currThemeColor.current = color;
    metaTag.current.setAttribute('content', currThemeColor.current);
  },
  {
    // Detect intersections at the very top of the screen
    rootMargin: '-0.05% 0px -99.9% 0px',
  },
);

// The bottom-of-screen intersection observer sets the background color
// and also updates the meta theme-color for one animation frame.
const observerBottom = new IntersectionObserver(
  (es) => {
    if (!metaTag.current) return;
    const selectedEntry = es.filter((e) => e.isIntersecting);
    const target = selectedEntry[0]?.target;
    if (!target) return;
    const color = target.getAttribute('data-metathemeswap-color');
    if (!color) return;
    document.body.style.backgroundColor = color;
    metaTag.current.setAttribute('content', currThemeColor.current + 'fe');
    const meta = metaTag.current;
    requestAnimationFrame(() => {
      meta.setAttribute('content', currThemeColor.current || '');
    });
  },
  {
    // Detect intersections at the very bottom of the screen
    rootMargin: '-99.9% 0px -0.05% 0px',
  },
);
Now we can observe whatever DOM element we desire to trigger color changes with a client-side hook and a ref:
export default function useMetaTheme(ref: RefObject<Element>, color: string) {
  const { observerTop, observerBottom } = useContext(MetaThemeContext);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.setAttribute('data-metathemeswap-color', color);
  }, [color, ref]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !observerTop) return;
    observerTop?.observe(node);
    return () => observerTop?.unobserve(node);
  }, [observerTop, ref]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !observerBottom) return;
    observerBottom?.observe(node);
    return () => observerBottom?.unobserve(node);
  }, [observerBottom, ref]);
}
For example, using the above implementation, here’s a small demo component that synchronizes whichever bar it overlaps with:
function ColoredSection({ color }: { color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useMetaTheme(ref, color);
  return (
    <div id={color} className="ColorSection" style={{ backgroundColor: color }} ref={ref}>
      {color}
    </div>
  )
}
For the full code, check out the work-in-progress NPM package meta-theme-swap I’ve published to make this easier for React projects (vanilla implementation coming soon):
meta-theme-swap
Synchronizes WebKit meta theme color with elements on the page.. Latest version: 0.0.6, last published: 6 hours ago…
www.npmjs.com
Pay close attention to the navigation bar’s updating code. We opt for triggering a repaint of the status bar by appending “fe” to the end of its hex code, and removing the “fe” on the next animation frame (to fully preserve visual appearance, as this only nudges the alpha value a bit more transparent, which is enough to be a “new color”). In this way, we control both the status bar and the navigation bar independently:
Press enter or click to view image in full size

A demo site for independently controlling the minimized navigation bar and status bar
And implemented back on my main website:
Press enter or click to view image in full size

That’s pretty much it! A fully unified, color-optimized design.
Conclusions
It’s likely that most websites will have no need for this complex of an implementation. For example, the traditional web interface with a sticky navbar at the top of the screen looks generally great just by setting the theme-color statically, as Quora does:
Press enter or click to view image in full size

Quora uses a static `theme-color` and white `background-color`, which looks great.
I’d also like to add that the theme-color native effect also can be seen in the desktop Safari browser, but only in light mode and in the compact tab view:
Press enter or click to view image in full size

And, in the end, I opted to choose the smooth CSS transitions styling both the status bar and the navigation bar with the background-color of the body, instead of using the split display. I may attempt to implement a tweening mechanism in the future to try to replicate the CSS transition for thetheme-color, but for now it’s good.
Hopefully you found this useful! For a more comprehensive writeup on the theme-color meta tag specifically, check out the amazing article below.
Meta Theme Color and Trickery | CSS-Tricks
Starting with Version 15, Safari supports the theme-color tag both on macOS and iOS. That's exciting news because now…
css-tricks.com
Webkit
CSS
IOS
Web Design
Web Development
120

3



evan kirkiles
Written by evan kirkiles
14 followers
·
0 following
programmer and designer

Follow
Responses (3)
Ion Utale
Ion Utale
What are your thoughts?﻿
Cancel
Respond
luis gerardo camara salinas
luis gerardo camara salinas
Oct 27, 2024

A threasure for my landing page, thanks man!
Reply
Greg Rosemblun
Greg Rosemblun
Jul 3, 2024

Amazing!!! Just working on something like this for a project and this is very well explained!
Reply
Surajan Shrestha
Surajan Shrestha
Apr 15, 2024

Was struggling with iPhones' Native Status bar colors, using <meta name="theme-color" content="#ffffff" /> solved it.
Thanks.
Reply
More from evan kirkiles
AWS Amplify: Cognito-Authorized GraphQL in a Lambda API (Part 1)
evan kirkiles
evan kirkiles
AWS Amplify: Cognito-Authorized GraphQL in a Lambda API (Part 1)
This post details the creation of a Lambda layer which can facilitate caller-Cognito-based GraphQL requests in Lambda REST API functions.
Mar 7, 2022
3


AWS Amplify: Cascade Deletion for GraphQL in a Lambda API (Part 2)
evan kirkiles
evan kirkiles
AWS Amplify: Cascade Deletion for GraphQL in a Lambda API (Part 2)
In Part 2, we build a Lambda function using our Lambda layer to implement cascade deletion behind a REST API for our AWS Amplify project.
Mar 7, 2022
2


AWS Amplify: Cognito Authorization for Lambda REST API (Part 3)
evan kirkiles
evan kirkiles
AWS Amplify: Cognito Authorization for Lambda REST API (Part 3)
We finally synthesize our Lambda Layer and Functions into a Cognito User-Pool authorized REST API for cascade deletion and GraphQL queries.
Mar 7, 2022
33
1


See all from evan kirkiles
Recommended from Medium
The Secret HTML Tags Top Developers Use
habtesoft
habtesoft
The Secret HTML Tags Top Developers Use
When most developers think of HTML, they think of the usual suspects: <div>, <span>, <p>, <h1>, and <a>. But HTML has a treasure trove of…

Sep 7
80


CSS @layer: How I Finally Stopped Fighting My Own Stylesheets
JavaScript in Plain English
In
JavaScript in Plain English
by
Mutasim Billah Toha
CSS @layer: How I Finally Stopped Fighting My Own Stylesheets
The Simple CSS Feature That Makes !important Obsolete

2d ago
8
1


10 Claude Prompts That Replaced My Frontend Dev
Hash Block
Hash Block
10 Claude Prompts That Replaced My Frontend Dev
Automate UI decisions, prototypes, and even component code using Claude

Aug 7
67


This new IDE from Amazon is an absolute game changer 😮
Coding Beauty
In
Coding Beauty
by
Tari Ibaba
This new IDE from Amazon is an absolute game changer 😮
Woah this is absolutely huge.

Sep 9
453
17


Why Every Senior Developer I Know Is Planning Their Exit
Harishsingh
Harishsingh
Why Every Senior Developer I Know Is Planning Their Exit
After 10 years in software development, with the last three in high-frequency trading, I’m witnessing something unprecedented: every senior…

Sep 4
3.3K
217


A middle-aged man with short dark hair, a beard, and glasses looks surprised and upset, surprised and angry. He wears a beige sweater and is positioned on the right side of the image against a light background. On the left, bold white text on a black rectangle reads, “YOUR CHATGPT HISTORY IS SHOWING UP ON GOOGLE. Here’s what to do.” Ask ChatGPT
How To Profit AI
In
How To Profit AI
by
Mohamed Bakry
Your ChatGPT History Just Went Public on Google. Here’s What I Did in 10 Mins to Fix It.
Safety/Privacy Check Prompt Template Is Included

1d ago
8.8K
265


See more recommendations
Help
Status
About
Careers
Press
Blog
Privacy
Rules
Terms
Text to speech
All your favorite parts of Medium are now in one sidebar for easy access.
Okay, got it


https://css-tricks.com/meta-theme-color-and-trickery/?source=post_page-----28d75cd8cf7f---------------------------------------



Skip to main content
CSS-Tricks
ARTICLES
NOTES
LINKS
GUIDES
ALMANAC
PICKS
SHUFFLE
Search
THEME-COLOR
Meta Theme Color and Trickery

Manuel Matuzovic on Nov 7, 2024
Get affordable and hassle-free WordPress hosting plans with Cloudways — start your free trial today.
Starting with Version 15, Safari supports the theme-color <meta> tag both on macOS and iOS. That’s exciting news because now the first desktop browser supports this <meta> tag and it also supports the media attribute and the prefers-color-scheme media feature.

I never really took much note of the theme-color meta tag, but now is a good time to learn about its features and limitations and try to discover some interesting use cases.

Heads up! Safari removed support for the theme-color meta tag in Safari Technology Preview (127). That was only temporary, starting with release 128 it supports it again.

Features and limitations

Here’s how I’ve been using the theme-color meta tag for the past few years: just a good ‘ol hex code for the content attribute.

<meta name="theme-color" content="#319197">

According to tests I made earlier this year, this works in Chrome, Brave and Samsung Internet on Android, installed PWAs in Chrome and now also in Safari Technology Preview.


Hex color support is great in all supported browsers.
CSS color support

One of the first questions that came to my mind was “Can we use color keywords, hsl(), rgb(), too?” According to the HTML spec, the value of the attribute can be any CSS color. I’ve created this theme-color testing CodePen to verify that.

<meta name="theme-color" content="hsl(24.3, 97.4%, 54.3%)">
Blank webpage with orange header.
The theme-color meta tags supports CSS colors in any form: keywords, rgb(), hsl() or hex code.
Blank webpage with a hot pink header. There are controls to the right of the webpage for browser testing.
Looking at Chrome 90 on an Android Galaxy S20
All supported browsers also support hsl() and rgb(). This is awesome because it allows us to do some pretty cool stuff with JavaScript. We’ll talk about that later, but first let’s look at some limitations.

Transparency

HEX codes, rbg(), hsl() and keywords are well and consistently supported, but colors that include transparency: not so much. Actually, they are supported in most browsers, but the results aren’t very consistent and sometimes unexpected.

transparent is a CSS color and used in the theme-color meta tag most browsers do what you’d expect. All regular mobile browsers don’t change color and display the default tab bar, but Safari on macOS and the Chrome Canary PWA on macOS turn the tab bar black. The PWA on Android falls back to theme-color defined in the manifest.json, which we’ll talk about in a bit.

Examples of the same white webpage with either white or dark headers with the browser vendor labeled above each one.
Browser with a transparent theme-color meta tag
All browsers interpret hsla() and rgba(), but they set the alpha value to 1. The only exception is Safari on macOS; it interprets the transparency, but it seems like the transparent color has a black baseline. This has the effect that the light orange color looks like dark orange.

Same browser comparison but all with orange headers, except Safari which is a darker brown.
hsla() applied to the theme-color meta tag
New color functions

Safari 15 is the first browser to support lab(), lch(), and hwb() color functions. These functions work if you use them in CSS, but not if you use them in the theme-color meta tag.

All three declarations work fine in Safari 15:

body {
  background-color: hwb(27 10% 28%);
  background-color: lch(67.5345% 42.5 258.2);
  background-color: lab(62.2345% -34.9638 47.7721);
}
If you use any of the new color functions in the theme-color meta tag, Safari doesn’t interpret them and falls back to its own algorithm of picking the color. It’s likely that Safari uses the background color of your <body> for the theme-color, which means that you might get the expected result without defining the theme-color explicitly.

<meta name="theme-color" content="lab(29.2345% 39.3825 20.0664)">
Green webpage with green header.
Please be aware that at the time of writing Safari 15 is the only browser to support these new colors functions.

currentColor

If CSS colors are supported, currentColor should work, too, right? No, unfortunately not in any browser. It’s probably an uncommon use case, but I would expect that we can set the theme-color to the current color of the <body> or <html> element.

<style>
  body {
    color: blue;
  }
</style>

<meta name="theme-color" content="currentColor">
I found a ticket in the WebKit bug tracker titled “<meta name="theme-color" content="..."> should also support CSS currentcolor.” Support might change in the future, if someone picks the ticket up.

Prohibited colors

When I was testing CSS color keywords, I used the color red and it didn’t work. First, I thought that keywords weren’t supported, but blue, hotpink, and green worked fine. As is turns out, there’s a narrow range of colors that Safari doesn’t support, colors that would get in the way of using the interface. red doesn’t work because it’s visually too close to the background color of the close button in the tab bar. This limitation is specific to Safari, in all other supported browsers any color seem to work fine.

Wbite webpage with a color picker set to red. The header of the browser is white.
If you set the theme-color to red, Safari uses any color it deems appropriate.
Custom properties

I don’t know enough about the internals of browsers and custom properties and if it’s even possible to access custom properties in the <head>, but I tried it anyway. Unfortunately, it didn’t work in any browser.

<style>
  :root {
    --theme: blue;
  }
</style>

<meta name="theme-color" content="var(--theme)">
That’s pretty much everything I wanted to know about basic support of the theme-color meta tag. Next, let’s see how to and how not to implement dark mode for the tab bar.

Dark mode

Safari 15 is the first desktop browser to support the media attribute and the prefers-color-scheme media feature on theme-color meta tags. Starting with version 93, Chrome supports it too, but only for installed progressive web apps.

According to the web app manifest page on web.dev, if you define multiple theme-color meta tags, browsers pick the first tag that matches.

<meta name="theme-color" content="#872e4e" media="(prefers-color-scheme: dark)">
I was eager to find out what happens in browsers that don’t support the media attribute. I’ve created a demo page for testing dark mode that includes the meta tags above and also allows you to install the site as a PWA. The webmanifest.json includes another color definition for the theme-color.

{
  "name": "My PWA",
  "icons": [
    {
      "src": "https://via.placeholder.com/144/00ff00",
      "sizes": "144x144",
      "type": "image/png"
    }
  ],
  "start_url": "/theme-color-darkmode.html",
  "display": "standalone",
  "background_color": "hsl(24.3, 97.4%, 54.3%)",
  "theme_color": "hsl(24.3, 97.4%, 54.3%)"
}
Here’s how supported browsers display the tab bar in light mode. It doesn’t matter if a browser supports the media attribute or not, it will interpret the first meta tag regardless.


Here’s how the tab bar on the same page looks like in dark mode. These results are more interesting because they vary a bit. The Canary PWA and Safari support and show the dark color. All mobile browsers use their default dark tab bar styling, except for Samsung Internet, which uses the light styling because it doesn’t support the prefers-color-scheme media feature. (TIL: This should change in the near future.)


I did one last test. I wanted to see what happens if I only define a theme color for dark mode, but access the page in light mode.

<meta name="theme-color" content="#872e4e" media="(prefers-color-scheme: dark)">

These results surprised me the most because I expected all mobile browsers to ignore the media attribute and just use the dark color in the meta tag regardless, but ordinary Chrome Canary completely ignores the whole meta tag, even though it doesn’t support the media attribute. As expected, both Canary PWAs fall back to the color defined in the manifest file.

The other interesting thing is that Safari displays a theme-color even though I haven’t defined one for light mode. That’s because Safari will pick a color on its own, if you don’t provide a theme-color. In this case, it uses the background color of the page, but it also might use the background color of the <header> element, for example.

If you want to define a theme color for light and dark mode, your best bet is to define both colors and use the first meta tag as a fallback for browsers that don’t support the media feature.

<meta name="theme-color" content="#319197" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#872e4e" media="(prefers-color-scheme: dark)">
Safari has proven that theme-color works great on desktop browsers, too. I’m sure that designers and developers will find many creative ways to use this meta tag, especially considering that the value can be changed via JavaScript. I’ve collected and created some interesting demos for your inspiration.

Demos and use cases

Theming
Page theming
Gradients
Form validation
Disco mode
Scrolling
Extracting color
That is just a handful of ideas, but I already like where this is going and I’m sure that you’ll come up with even more creatives ways of using the theme-color meta tag.

Resources

theme-color specification
Design for Safari 15
Dark Mode in Samsung Internet
Psst! Create a DigitalOcean account and get $200 in free credit for cloud-based hosting and services.
Comments

Inad
Permalink to comment# July 14, 2021
theme-color isnt working for me on Safari 15 on Big Sur. Does this happen to anyone else?

Manuel Matuzovic
Permalink to comment# July 14, 2021
As Miguel already mentioned, they’ve removed support in the current version of Safari TP (127).

https://developer.apple.com/safari/technology-preview/release-notes/

Spenser
Permalink to comment# September 26, 2021
whats weird for me is it only seems to work with some colors as I write this. Like “#eac8df” doesn’t work but “#9a702a” does. As does just “blue”. And this is all only on desktop it seems to work fine on iOS15. I’m at a bit of a loss here.

Vladimir Nikishin
Permalink to comment# July 14, 2021
Does it still make sense to add such a

meta(name='apple-mobile-web-app-status-bar-style')?
to the head?

Manuel Matuzovic
Permalink to comment# July 24, 2021
Great question! I didn’t have the chance yet to test on mobile Safari, but I will update the post as soon as I have.

Miguel
Permalink to comment# July 14, 2021
This was removed on the last Safari Technology Preview update (release 127) but based on their note about theme colour it looks like it’s temporary:
https://developer.apple.com/safari/technology-preview/release-notes/

Anders
Permalink to comment# August 4, 2021
In Safari Technology Preview release 128 (yesterday) this works again.

Manuel Matuzovic
Permalink to comment# August 6, 2021
Thanks for letting me know, Anders. I’ve updated the post!

Liang
Permalink to comment# February 4, 2022
I found that on iOS pwa mode, if you change theme color, it has an unexpected transition effect, but it doesn’t have any effect like this on mobile safari. I have disabled all transtion on html and body tags in css, but the transition effect still exists. Do you know any way of disabling that?

Manuel Matuzovic
Permalink to comment# February 13, 2022
What do you mean by changing theme color? Switching from light to dark mode? And what kind of unexpected transition? Do you have link I can use to test it myself?

Timo
Permalink to comment# March 26, 2022
Here is a nice demo page: https://roger.pub/theme-color-preview/

It doesn’t work in macOS 12.1 Safari 15.2. But it works in iOS Safari.

Randy
Permalink to comment# May 12, 2022
Hey! Is it possible to get an effect like black-translucent? I basically have an animated background on my site and would like it to “expand” into the notch safe area

Diego
Permalink to comment# September 18, 2022
For some weird reason, safari in ios 16.0 doesn’t respect if the theme-color value is #ffffff

Diego
Permalink to comment# September 18, 2022
If you have for example a header with a red background, Safari ios will replace the theme-color for the same as the top element instead of using the one you set in the meta tag.

Manuel Matuzovic
Permalink to comment# September 26, 2022
This is probably due to the fact that there are prohibited colors in Safari. See: https://css-tricks.com/meta-theme-color-and-trickery/#aa-prohibited-colors

Jens
Permalink to comment# September 29, 2022
Awesome overview, Manuel!

Is there a valid (conformant) theme color method in sight, which works with both light and dark mode? AFAIK there’s no traction on a CSS-only solution?

Jens
Permalink to comment# October 4, 2022
Update: It seems the conformance issue is a false positive in the HTML validator. That doesn’t make light and dark mode support attractive from a maintainability perspective, but at least it’s not fantasy HTML.

Manuel Matuzovic
Permalink to comment# October 13, 2022
Sorry for the late reply and thanks for the answer. I had no idea! :)

This comment thread is closed. If you have important information to share, please contact us.

Safari 15: New UI, Theme Colors, and… a CSS-Tricks Cameo!
There's a 33-minute video (and resources) over on apple.com covering the upcoming Safari changes we saw in the WWDC keynote this year in much more detail. Look who's got a little cameo in there: Perhaps the most noticeable thing there in Safari 15 on iOS is URL bar at the…
June 11, 2021

Explain the First 10 Lines of Twitter’s Source Code to Me
For the past few weeks, I’ve been hiring for a senior full-stack JavaScript engineer at my rental furniture company, Pabio. Since we’re a remote team, we conduct our interviews on Zoom, and I’ve observed that some developers are not great at live-coding or whiteboard interviews, even if they’re good at…
February 24, 2022

Dark Mode in CSS Guide
“Dark mode” is defined as a color scheme that uses light-colored text and other UI elements on a dark-colored background. Dark mode, dark theme, black mode, night mode… they all refer to and mean the same thing: a mostly-dark interface rather than a mostly-light interface.
July 1, 2020
CSS-Tricks is powered by DigitalOcean.
KEEP UP TO DATE ON WEB DEV
with our hand-crafted newsletter


SUBSCRIBE
DIGITALOCEAN
About DO
Cloudways
Legal stuff
Get free credit!
CSS-TRICKS
Contact
Write for CSS-Tricks!
Advertise with us
SOCIAL
RSS Feeds
CodePen
Mastodon
Bluesky
