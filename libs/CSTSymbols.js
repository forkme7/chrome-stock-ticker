
var CSTSymbols = function(html, patterns, resource) {
    // The document that will be examined for symbols.
    this.html = html;
    // Detect ticker symbols by matching a href urls to these patterns.
    this.patterns = patterns;
    if (typeof(patterns) == 'undefined' || patterns.length < 1) {
        this.patterns = CSTSymbols.getDefaultPatterns();
    }
    // Resource to map symbol metric (IBM: 'price') to value.
    this.resource = resource;
    // Store which symbols have been found in document.
    this.symbols = [];
    // Store fully loaded tickers (symbols plus metric data).
    this.tickers = [];
    // Track which symbols are currently being loaded into ticker objects.
    this.fetching = [];
};
/**
 * Detect ticker symbols on current page by matching href urls to patterns.
 *
 * Static method.
 *
 * @param array patterns
 *   Each element containing regex pattern in the form of /pattern/i.
 *   Do not enclose the pattern in a sting.
 *
 * @return array
 *   Each element being a symbol found, or an empty array if none found.
 */
CSTSymbols.prototype.findSymbols = function() {
    var symbols = [];
    var thisSymbols = this;
    // Iterate through all 'a' elements.
    $(this.html).find('a').each(function() {
        var href = $(this).attr('href');
        // If the element has a 'href' attribute.
        if (typeof(href) != 'undefined') {
            try {
                href = decodeURIComponent(href);
                for (i=0; i<thisSymbols.patterns.length; i++) {
                    var match;
                    var regex = new RegExp(thisSymbols.patterns[i].pattern, thisSymbols.patterns[i].options);
                    // If the href attribute matches one of our patterns.
                    while ((match = regex.exec(href)) !== null) {
                        symbols.push(match[thisSymbols.patterns[i].result].toUpperCase());
                    }
                }
            } catch (err) {
                console.log('Can not examine href (' + href + '): ' + err);
            }
        }
    });
    // Remove any duplicates from tickers array.
    $.each(symbols, function(i, el){
        if($.inArray(el, thisSymbols.symbols) === -1) thisSymbols.symbols.push(el);
    });
};
/**
 * Remove a symbol from the fetching ticker list.
 *
 * When the last symbol is removed from the list then fire the callback
 * function informing the caller that all tickers have been loaded.
 */
CSTSymbols.prototype.fetchingRemove = function(value, callback) {
    this.fetching.splice(this.fetching.indexOf(value), 1);
    if (!this.fetching.length) {
        callback();
    }
}
/**
 * Return a minimal set of default patterns.
 *
 * Static method.
 */
CSTSymbols.getDefaultPatterns = function() {
    var patterns = [
        { pattern: '(ticker|symb).*?[^A-Z]{1}([A-Z]{1,4})([^A-Z]+|$)', options: 'g', result: 2 },
        { pattern: 'investing/stock/([A-Z]{1,4})', options: 'g', result: 1 }
    ];
    return patterns;
}
