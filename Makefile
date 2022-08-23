download:
	node bin/dl-sheet.js 1z1cdAn9hz2KJMmM3L7LQFbPfH0R_wN1f6urIJ3G-voE stories stories
	node bin/dl-sheet.js 1z1cdAn9hz2KJMmM3L7LQFbPfH0R_wN1f6urIJ3G-voE shop shop

run:
	node bin/index.js

wilson:
	node bin/dl-sheet.js 1z1cdAn9hz2KJMmM3L7LQFbPfH0R_wN1f6urIJ3G-voE wilson_trail wilson

lantau:
	node bin/dl-sheet.js 1z1cdAn9hz2KJMmM3L7LQFbPfH0R_wN1f6urIJ3G-voE lantau_trail lantau

via:
	node bin/dl-sheet.js 1z1cdAn9hz2KJMmM3L7LQFbPfH0R_wN1f6urIJ3G-voE via_alpina via_alpina	

photos:
	mogrify -resize 1050x a/stories/lantau-trail/photos/*.jpg