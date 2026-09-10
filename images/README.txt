Put future images here (e.g. logo.png, article photos).

To use a real logo image instead of the text-based logo:
1. Add your file, e.g. images/logo.png
2. In index.html and pages/category.html, replace the <span id="logoBadge">
   element with:
     <img id="logoBadge" src="../images/logo.png" alt="">
   (use "images/logo.png" with no "../" in index.html, since it lives at
   the project root; use "../images/logo.png" inside pages/category.html)
3. The box is already sized correctly by SITE.logoWidth / SITE.logoHeight
   in data.js — the image will fit without stretching.
