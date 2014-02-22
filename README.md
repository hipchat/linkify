Linkify
=======

To make use of the library, get the source code from the git repository here: http://github.com/hipchat/linkify/archives/master or check out the repository using:

    %> git clone git@github.com:hipchat/linkify.git

Take the code approrpriate to the language you're coding in as described below.


JavaScript
----------

Copy the linkify.js file to your own repository/web server.  Include linkify.js on your page.  The linkification function can be accessed throught he global linkify object:

    <script>
      var linkified_text = linkify.linkify(unlinkified_text, ...);
    </script>
