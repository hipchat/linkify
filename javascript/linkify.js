linkify = {
  // Static values used in creating the URL regexes
  RE_EMAIL_PATTERN: '\\b[\\w.-]+\\+*[\\w.-]+@(?:(?:[\\w-]+\\.)+[A-Za-z]{2,6}|(?:\\d{1,3}\\.){3}\\d{1,3})',
  RE_TLD: '(?:aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|travel|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|fi|fj|fk|fm|fo|fr|ga|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)',
  RE_URL_MIDCHAR: '[\\S]',  // characters allowed in URL center
  RE_URL_ENDCHAR: '[\\w@?^=%&/~\+#-]',              // URL must end with one of these chars
  RE_URL_SCHEME: '(?:http|ftp|https|news|mms)://',  // protocol

  // Intialize the linkification variables
  // Call this before calling linkify(...)
  init: function() {
    this.RE_URL_ENDING = '(?:'+this.RE_URL_MIDCHAR+'*'+this.RE_URL_ENDCHAR+')?';
    this.RE_FULL_URL = this.RE_URL_SCHEME+'\\w+(?:.\\w+)'+this.RE_URL_ENDING;
    this.RE_OTHER_URL = '\\w[\\w_-]*(?:\\.\\w[\\w_-]*)*\\.'+this.RE_TLD+'(?:\\/'+this.RE_URL_ENDING+')?\\b';
  },

  /**
   * Linkify a string, replacing text urls with <a href="url">url</a>
   * Note: init must be called before this function can be used
   *
   * @param text - String to be linkified
   * @param truncate_length - Truncate displayed links to this length
   * @param matched_links - Return param (pass by ref) - Array of links matched during linkification
   **/
  linkify: function(text, truncate_length, matched_links) {
    text = this.match_and_replace(this.RE_EMAIL_PATTERN, text, false, false, truncate_length, matched_links);
    text = this.match_and_replace(this.RE_FULL_URL, text, true, false, truncate_length, matched_links);
    text = this.match_and_replace(this.RE_OTHER_URL, text, true, true, truncate_length, matched_links);

    return text;
  },

  /**
   * Internal helper function for linkification
   **/
  match_and_replace: function(pattern, input, is_url, add_http, truncate_length, matched_links) {
    if (typeof add_http == 'undefined') {
      add_http = true;
    }

    var start = 0;
    var offset = 0;
    var match_length = 0;
    var end_tag_pos = 0;
    var close_anchor_re = /<\/[aA]>/;
    var re = new RegExp(pattern, "g");

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
      var actual = input.substr(start, match_length);

      if (add_http) {
        actual = 'http://'+actual;
      }
      var replacement = '<a target="_blank" href="';

      if (!is_url) {
        replacement += 'mailto:';
      }

      actual = actual.replace(/"/g, '%22');
      replacement += actual+'"';
      replacement += ' title="';

      if (is_url) replacement += actual;
      else replacement += 'Email '+actual;

      replacement += '"';

      if (truncate_length && address.length > truncate_length) {
            address = address.substr(0, truncate_length) + '...';
        }

      // Add word break tags to allow wrapping where appropriate
      replacement += '>'+address.replace(new RegExp("([/=])", 'g'), "<wbr>$1")+'</a>';
      if (matched_links) {
        matched_links.push(actual);
      }

      input = input.slice(0, start) + replacement + input.slice(start+match_length, input.length);
      re.lastIndex = start + replacement.length;
      offset = start + replacement.length;
    }

    return input;
  }

};
