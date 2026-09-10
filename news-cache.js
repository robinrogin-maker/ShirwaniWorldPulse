/* =========================================================================
   news-cache.js - news cache for ShirwaniWorldPulse
   -------------------------------------------------------------------------
   FIX (stale news): this file used to ship hundreds of hard-coded articles
   from an old fetch date, and those frozen items kept showing up on top of
   the live feeds ("old news that never changes"). The bundled snapshot is
   now EMPTY on purpose: every category is filled only from live RSS at
   runtime, plus whatever the visitor's own browser cached on the last
   visit. The structure is kept so the rest of the code keeps working.
   ========================================================================= */

const NEWS_CACHE = {
  "ar": {
    "world": [],
    "economy": [],
    "sport": [],
    "health": [],
    "tech": [],
    "tourism": [],
    "music": [],
    "cars": [],
    "horoscope": []
  },
  "en": {
    "world": [],
    "economy": [],
    "sport": [],
    "health": [],
    "tech": [],
    "tourism": [],
    "music": [],
    "cars": [],
    "horoscope": []
  },
  "sv": {
    "world": [],
    "economy": [],
    "sport": [],
    "health": [],
    "tech": [],
    "tourism": [],
    "music": [],
    "cars": [],
    "horoscope": []
  }
};
