; (function ($, window, document, undefined) {
  "use strict";

  const pluginName = "wordSearch"; 

  var defaults = {
    instructions: "Find the following words:",
    sizeX: 0,
    sizeY: 0,
    matrix: [],
    riddles: [],
    css: {
      instructionPanelClass: "instruction-panel",
      instructionsClass: "instructions",
      searchWordsClass: "search-words",
      gamePanelContainerClass: "game-panel-container",
      gamePanelClass: "game-panel",
      gamePanelRowClass: "game-panel-row",
      gamePanelCellClass: "game-panel-cell",
      gameCellValueClass: "game-panel-cell-value"
    },
    callbacks: {
      buildQuestion: function (riddle) {
        return riddle.name
      }
    }
  };

  function WordSearch(element, options) {

    const $target = (element instanceof jQuery) ? element : $(element);
    $target.html("");

    const self = this;

    var local = {
      settings: null,
      completed: false,
      userAnswer: [],
      correctAnswer: []
    };

    local.settings = $.extend(true, {}, defaults, options);

    for (var y = 0; y < local.settings.sizeY; y++) {
      var arr1 = [];
      var arr2 = [];
      for (var x = 0; x < local.settings.sizeX; x++) {
        arr1.push(0);
        arr2.push(0);
      }
      local.userAnswer.push(arr1);
      local.correctAnswer.push(arr2);
    }

    var $findPanel = $("<div class='" + local.settings.css.instructionPanelClass + "'>" +
      "<div class='" + local.settings.css.instructionsClass + "'>" + local.settings.instructions + "</div>" +
      "</div>");

    var $wordList = $("<ol class='" + local.settings.css.searchWordsClass + "'></ol>").appendTo($findPanel);

    $.each(local.settings.riddles, function (i, item) {
      $wordList.append($("<li>" + local.settings.callbacks.buildQuestion(item) + "</li>"));

      $.each(item.answer, function (i2, e) {
        local.correctAnswer[e.y][e.x] = 1;
      });

    });


    $target.append($findPanel);

    var $panelContainer = $("<div class='" + local.settings.css.gamePanelContainerClass + "'></div>");
    var $panel = $("<div class='" + local.settings.css.gamePanelClass + "'></div>").appendTo($panelContainer);
    var $rowTemplate = $("<div class='" + local.settings.css.gamePanelRowClass + "'></div>");
    var $cellTemplate = $("<span class='" + local.settings.css.gamePanelCellClass + "'></span>");

    $.each(local.settings.matrix, function (y, itemY) {
      var $row = $rowTemplate.clone();
      $panel.append($row);
      $.each(itemY, function (x, itemX) {
        var $cell = $cellTemplate.clone();
        $cell.data("x", x).data("y", y).data("checked", false).appendTo($row)
        $("<span class='" + local.settings.css.gameCellValueClass + "'></span>")
          .append(itemX)
          .appendTo($cell)
          .on("mousedown mouseenter", function (event) {
            if (local.completed) return;

            if (event.type == "mousedown" || (event.type == "mouseenter" && (event.buttons == 1 || event.buttons == 3))) {
              var $this = $(this).closest("." + local.settings.css.gamePanelCellClass);

              $this.data("checked", !$this.data("checked"));
              if ($this.data("checked")) {
                local.userAnswer[$this.data("y")][$this.data("x")] = 1;
                $this.css({ "background-color": "#000000", "color": "#ffffff" });
              } else if (event.type != "mouseenter") {
                local.userAnswer[$this.data("y")][$this.data("x")] = 0;
                $this.css({ "background-color": "#ffffff", "color": "#000000" });
              }
            }
          });
      });
    });

    $target.append($panelContainer);

    function markCompleted() {
      local.completed = true;
    }

    function isMarkedCompleted() {
      return local.completed;
    }

    function isSolved() {
      for (var x = 0; x < local.settings.sizeX; x++) {
        for (var y = 0; y < local.settings.sizeY; y++) {
          if (local.userAnswer[y][x] != local.correctAnswer[y][x]) {
            return false;
          }
        }
      }

      return true;
    }

    function showResult() {
      for (var x = 0; x < local.settings.sizeX; x++) {
        for (var y = 0; y < local.settings.sizeY; y++) {

          var $e = $panel.find("." + local.settings.css.gamePanelCellClass).filter(function (i, e) {
            return $(e).data("x") == x && $(e).data("y") == y
          });

          if (local.userAnswer[y][x] != local.correctAnswer[y][x]) {
            if (local.correctAnswer[y][x] == "1") {
              $e.css({ "background-color": "#0000ff", "color": "#ffffff" });
            } else {
              $e.css({ "background-color": "#ff0000", "color": "#ffffff" });
            }
          } else if (local.correctAnswer[y][x] == 1) {
            $e.css({ "background-color": "#008800", "color": "#ffffff" });
          }
        }
      }
    }

    function hideResult() {
      for (var x = 0; x < local.settings.sizeX; x++) {
        for (var y = 0; y < local.settings.sizeY; y++) {

          var $e = $panel.find("." + local.settings.css.gamePanelCellClass).filter(function (i, e) {
            return $(e).data("x") == x && $(e).data("y") == y
          });

          $e.css({ "background-color": "", "color": "" });
        }
      }
    }

    return {
      isSolved: isSolved,
      showResult: showResult,
      hideResult: hideResult,
      markCompleted: markCompleted,
      isMarkedCompleted: isMarkedCompleted
    };
  }

  WordSearch.prototype = {
    isSolved: function () {
      isSolved();
    },
    showResult: function () {
      showResult();
    },
    hideResult: function () {
      hideResult();
    },
    markCompleted: function () {
      markCompleted();
    },
    isMarkedCompleted: function () {
      return isMarkedCompleted();
    }

  }

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, pluginName)) {
        var plugin = new WordSearch(this, options);
        $.data(this, pluginName, plugin);
      }
    });
  }

})(jQuery, window, document);
