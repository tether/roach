
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

modules:  package.json
	@npm install

test: modules
	./node_modules/.bin/mocha 

clean:
	rm -fr build components

.PHONY: clean
