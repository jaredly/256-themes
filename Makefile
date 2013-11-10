
all: index.html css/index.css js/index.js

index.html:
	jade index.jade

css/index.css:
	stylus index.styl
	mv index.css css

js/index.js: components index.js
	@component build --dev
	mv build/build.js js/index.js

components: component.json
	@component install --dev

serve:
	python -m SimpleHTTPServer

clean:
	rm -fr build components template.js

.PHONY: clean
