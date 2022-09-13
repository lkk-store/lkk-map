download:
	node bin/dl-sheet.js 1z1cdAn9hz2KJMmM3L7LQFbPfH0R_wN1f6urIJ3G-voE stories stories
	node bin/dl-sheet.js 1z1cdAn9hz2KJMmM3L7LQFbPfH0R_wN1f6urIJ3G-voE shop shop

run:
	node bin/index.js

wilson:
	node bin/dl-sheet.js 1z1cdAn9hz2KJMmM3L7LQFbPfH0R_wN1f6urIJ3G-voE wilson_trail wilson

lantau:
	node bin/dl-sheet.js 1z1cdAn9hz2KJMmM3L7LQFbPfH0R_wN1f6urIJ3G-voE lantau_trail lantau

mac:
	node bin/dl-sheet.js 1z1cdAn9hz2KJMmM3L7LQFbPfH0R_wN1f6urIJ3G-voE maclehose_trail maclehose

via:
	node bin/dl-sheet.js 1z1cdAn9hz2KJMmM3L7LQFbPfH0R_wN1f6urIJ3G-voE via_alpina via_alpina	

photos:
	mogrify -resize 100x a/stories/maclehose-trail/photos-100/*.jpg

mon:
	montage wood-2021-08-21.jpg	wood-2021-09-05.jpg	wood-2021-12-05.jpg	wood-2021-12-10.jpg	wood-2021-12-31.jpg	wood-2022-01-03.jpg	wood-2022-02-06.jpg	wood-2022-02-07.jpg	wood-2022-02-12.jpg	wood-2022-02-15.jpg	wood-2022-02-27.jpg	wood-2022-04-25.jpg	wood-2022-06-20.jpg	wood-2022-06-22.jpg	wood-2022-08-14.jpg	wood-2022-08-16.jpg -geometry +0+0 -tile 4x montage.jpg

	

	