
VUE_MIN_JS=node_modules/vue/dist/vue.min.js

JS_OUTPUT_DIR=priv/static/js
JS_OUTPUT_LIB_DIR=$(JS_OUTPUT_DIR)/lib
VUE_OUTPUT=$(JS_OUTPUT_LIB_DIR)/vue.min.js

setup: $(VUE_OUTPUT)

$(VUE_OUTPUT): $(VUE_MIN_JS)
	mkdir -p $(JS_OUTPUT_LIB_DIR)
	cat $(VUE_MIN_JS) > $(VUE_OUTPUT)
