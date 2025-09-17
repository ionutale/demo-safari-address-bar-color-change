import { w as head, v as pop, t as push } from "../../chunks/index.js";
import { e as escape_html } from "../../chunks/escaping.js";
function _page($$payload, $$props) {
  push();
  let currentColor = "#ffffff";
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Safari Address Bar Color Demo</title>`;
    $$payload2.out.push(`<meta name="description" content="Demo of dynamic Safari address bar color changes"/>`);
  });
  $$payload.out.push(`<div class="min-h-screen"><section class="h-screen flex items-center justify-center bg-white text-black"><div class="text-center"><h1 class="text-4xl font-bold mb-4">Safari Address Bar Demo</h1> <p class="text-xl mb-8">Scroll down to see the address bar colors change</p> <p class="text-lg">Current color: ${escape_html(currentColor)}</p></div></section> <section class="h-screen flex items-center justify-center bg-gray-400 text-black"><div class="text-center"><h1 class="text-4xl font-bold mb-4">Gray Section</h1> <p class="text-xl mb-8">The address bar should now be gray</p> <p class="text-lg">Current color: ${escape_html(currentColor)}</p></div></section> <section class="h-screen flex items-center justify-center bg-black text-white"><div class="text-center"><h1 class="text-4xl font-bold mb-4">Black Section</h1> <p class="text-xl mb-8">The address bar should now be black</p> <p class="text-lg">Current color: ${escape_html(currentColor)}</p></div></section> <section class="h-screen flex items-center justify-center bg-blue-500 text-white"><div class="text-center"><h1 class="text-4xl font-bold mb-4">Blue Section</h1> <p class="text-xl mb-8">Blue background with white text</p> <p class="text-lg">Current color: ${escape_html(currentColor)}</p></div></section> <section class="h-screen flex items-center justify-center bg-red-500 text-white"><div class="text-center"><h1 class="text-4xl font-bold mb-4">Red Section</h1> <p class="text-xl mb-8">Red background with white text</p> <p class="text-lg">Current color: ${escape_html(currentColor)}</p></div></section> <section class="h-screen flex items-center justify-center bg-green-500 text-white"><div class="text-center"><h1 class="text-4xl font-bold mb-4">Green Section</h1> <p class="text-xl mb-8">Green background with white text</p> <p class="text-lg">Current color: ${escape_html(currentColor)}</p></div></section></div>`);
  pop();
}
export {
  _page as default
};
