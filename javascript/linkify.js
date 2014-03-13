linkify = {
  // Static values used in creating the URL regexes
  RE_EMAIL_PATTERN: "[a-z0-9!#$%&'*+/=?^_`{|}~\\-]+(?:[.][a-z0-9!#$%&'*+/=?^_`{|}~\\-]+)*@(?:[a-z0-9](?:[a-z0-9\\-]*[a-z0-9])?[.])+[a-z0-9](?:[a-z0-9\\-]*[a-z0-9])?",
  // adapted from: http://daringfireball.net/2010/07/improved_regex_for_matching_urls
  RE_URL: 
    '\\b' +
    '(' +
      '(?:' +
        '((?!javascript)[a-z][\\w\\-]+:' + // URL protocol and colon (not javascript:) -- captured so we can add http if needed
        '(?:' +
          '/{1,3}' + // 1-3 slashes
        '))' +
        '|' +
        '(?:[a-z0-9.\\-]+[.]' +
        '(?:com|net|org|edu|gov|mil|aero|asia|biz|cat|coop|info|int|jobs|mobi|museum|name|post|pro|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|ja|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)' +
        '[/#?])' +
      ')' +
      '[\\w#?]' + // force a word char or #? char after the url scheme
      '(?:' +
        '(?:%[0-9a-f]{2})' + // allow url encoded values
        '|' +
        '(?::\\d+)' + // :port, insert no colons allowed joke here
        '|' +
        '[a-z0-9\\-._~/?#[\\]@!$&\'*+,;=]' +  // allowable chars per http://tools.ietf.org/html/rfc3986#section-2
        '|' +
        '(?:\\([^\\s\\()]*?\\([^\\s\\()]+\\)[^\\s\\()]*?\\))' + // balanced parens, one level deep: (…(…)…)
        '|' + 
        '(?:\\([^\\s]+?\\))' + // balanced parens, non-recursive: (…)
      ')+' +
      '(?:' +
        '(?:\\([^\\s()]*?\\([^\\s()]+\\)[^\\s()]*?\\))' + //balanced parens, one level deep: (…(…)…)
        '|' +
        '(?:\\([^\\s]+?\\))' + // balanced parens, non-recursive: (…)
        '|' +
        '[^\\s`!()\\[\\]:{};\'".,<>?«»“”‘’]' + // not a space or one of these punct chars
      ')' +
      '|' + // OR, the following to match naked domains:
      '(?:' +
        '[a-z0-9]+' +
        '(?:[.\\-][a-z0-9]+)*' +
        '[.]' +
        // removed py and sh to avoid linking script filenames
        '(?:com|net|org|edu|gov|mil|aero|asia|biz|cat|coop|info|int|jobs|mobi|museum|name|post|pro|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|si|sj|ja|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)' +
        '\\b/?' +
        '(?!@)' + // not succeeded by a @, avoid matching "foo.na" in "foo.na@example.com"
      ')' +
    ')',

  // Add <wbr> tags to displayed text to allow wrapping?
  add_wbrs: true,

  // Truncate displayed links to this length
  truncate_length: null,

  // Target for links
  link_target: "_blank",

  // Add titles for links?
  link_titles: true,

  /**
   * Linkify a string, replacing text urls with <a href="url">url</a>
   * Note: init must be called before this function can be used
   *
   * @param text - String to be linkified
   * @param matched_links - Return param (pass by ref) - Array of links matched during linkification
   **/
  linkify: function(text, matched_links) {
    text = this.match_and_replace(this.RE_EMAIL_PATTERN, text, true, false, matched_links);
    text = this.match_and_replace(this.RE_URL, text, false, true, matched_links);

    return text;
  },

  /**
   * Internal helper function for linkification
   **/
  match_and_replace: function(pattern, input, is_email, add_http, matched_links) {
    var start = 0;
    var offset = 0;
    var match_length = 0;
    var end_tag_pos = 0;
    var close_anchor_re = /<\/[aA]>/;
    var re = new RegExp(pattern, "gi");

    var match = {};
    var max_iter = 20;
    var cur_iter = 0;
    while (match = re.exec(input)) {
      cur_iter++;
      if (cur_iter > max_iter)
        break;

      start = match.index; // start of match
      match_length = match[0].length;

      // If we find an opening a tag, advance to its end and continue looking
      var substr = input.substring(offset, start);
      if (substr.search(/<[aA]/) >= 0) {
        close_anchor_re.lastIndex = offset;
        var close_anchor_pos = input.substring(offset, input.length).search(close_anchor_re);

        // If we find an opening tag without a matching closing tag, just return the input we have
        if (close_anchor_pos < 0)
          return input;

        end_tag_pos = close_anchor_pos + offset;

        // RegExp.lastIndex is used to tell the regexp where to start matching
        re.lastIndex = end_tag_pos + 4;
        offset = end_tag_pos + 4;

        continue;
      }

      // Do the actual replecement of text with anchor tag
      var address = input.substr(start, match_length);
      var actual = address;

      if (add_http && !match[2]) {
        actual = 'http://'+actual;
      }

      var replacement = '<a';

      // link target?
      if (this.link_target) {
        replacement += ' target="'+this.link_target+'"';
      }

      replacement += ' href="';

      if (is_email) {
        replacement += 'mailto:';
      }

      actual = actual.replace(/"/g, '%22');
      replacement += actual+'"';

      // add title
      if (this.link_titles) {
        var title = is_email ? 'Email ' + actual : actual;
        replacement += ' title="'+title+'"';
      }

      // Truncate displayed text if requested
      if (this.truncate_length && address.length > this.truncate_length) {
        address = address.substr(0, this.truncate_length) + '...';
      }

      // Add word break tags to allow wrapping where appropriate
      if (this.add_wbrs) {
        address = address.replace(new RegExp("([/=])", 'g'), "<wbr>$1");
      }

      replacement += '>'+address+'</a>';

      // Record what was matched
      if (matched_links) {
        matched_links.push(actual);
      }

      // Do the replacement
      input = input.slice(0, start) + replacement + input.slice(start+match_length, input.length);
      re.lastIndex = start + replacement.length;
      offset = start + replacement.length;
    }

    return input;
  }

};
