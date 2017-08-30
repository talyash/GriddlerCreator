if (!String.prototype.repeat) {
    String.prototype.repeat = function(count) {
        'use strict';
        if (this == null) {
            throw new TypeError('can\'t convert ' + this + ' to object');
        }
        var str = '' + this;
        count = +count;
        if (count != count) {
            count = 0;
        }
        if (count < 0) {
            throw new RangeError('repeat count must be non-negative');
        }
        if (count == Infinity) {
            throw new RangeError('repeat count must be less than infinity');
        }
        count = Math.floor(count);
        if (str.length == 0 || count == 0) {
            return '';
        }
        // Ensuring count is a 31-bit integer allows us to heavily optimize the
        // main part. But anyway, most current (August 2014) browsers can't handle
        // strings 1 << 28 chars or longer, so:
        if (str.length * count >= 1 << 28) {
            throw new RangeError('repeat count must not overflow maximum string size');
        }
        var rpt = '';
        for (var i = 0; i < count; i++) {
            rpt += str;
        }
        return rpt;
    }
}
$(document).ready(function(){
    var griddler = $('#Griddler');
    var rows = $('#rows');
    var columns = $('#columns');
    var currentColor = 1;
    var codeTextarea = $('#GriddlerCode');
    var columnNumbers = $('#ColumnNumbers')
    var rowNumbers = $('#RowNumbers');
    function CreateGrid(rows,columns) {
        griddler.css('width',(columns*1.0625)+.0625+'em');
        griddler.html(('<div class="row">' + '<div class="cell"></div>'.repeat(columns) + '</div>').repeat(rows));
        ClearNumbers();
    }
    CreateGrid(40,40);
    function ExportGriddler() {
        var code = '';
        griddler.children().each(function(){
            var row = $(this);
            code += 'r';
            row.children().each(function(){
                if($(this).hasClass('clicked'))
                    code += 'c';
                else
                    code += 'e';
            });
        });
        return code;
    }
    function ImportGriddler() {
        var code = codeTextarea[0].value;
        var griddlerhtml = '<div class="row">';
        for (var i=1; i < code.length; i++)
        {
            var letter = code.charAt(i);
            switch(letter) {
                case 'r':
                    griddlerhtml += '</div><div class="row">';
                    break;
                case 'c':
                    griddlerhtml += '<div class="cell clicked"></div>';
                    break;
                case 'e':
                    griddlerhtml += '<div class="cell"></div>';
                    break;
                default:;
            } 
        }
        griddler.html(griddlerhtml+'</div>');
        griddler.css('width',(griddler.children().eq(0).children().length*1.0625)+.0625+'em');
        codeTextarea[0].value = '';
        ClearNumbers();
    }
    function RowToNumbers(row) {
        var rowLen = row.length;
        var numbers = '';
        if(rowLen) {
            var num = 1;
            for(var i=0; i < rowLen; i++) {
                var cell = row.eq(i);
                if(i != rowLen-1) {
                    var nextCell = row.eq(i+1);
                    if(cell.index() + 1 - nextCell.index() == 0) {
                        num++;
                    }
                    else {
                        numbers += '<span class="num-box"><span class="num">'+num+'</span></span>';
                        num = 1;
                    }
                }
                else {
                    numbers += '<span class="num-box"><span class="num">'+num+'</span></span>';
                }
            }
        }
        else
            numbers = '<span class="num-box"><span class="num">0</span></span>';
        return '<div>'+numbers+'</div>';
    }
    function ColumnToNumbers(column) {
        var columnLen = column.length;
        var numbers = '';
        if(columnLen) {
            var num = 1;
            for(var i=0; i < columnLen; i++) {
                var cell = column.eq(i);
                if(i != columnLen-1) {
                    var nextCell = column.eq(i+1);
                    if(cell.parent().index() + 1 - nextCell.parent().index() == 0) {
                        num++;
                    }
                    else {
                        numbers += '<span class="num-box"><span class="num">'+num+'</span></span>';
                        num = 1;
                    }
                }
                else {
                    numbers += '<span class="num-box"><span class="num">'+num+'</span></span>';
                }
            }
        }
        else
            numbers = '<span class="num-box"><span class="num">0</span></span>';
        return '<div>'+numbers+'</div>';
    }
    function GenerateNumbers() {
        var rowNumbersCode = '';
        griddler.children().each(function(index){
            var row = $(this);
            var cells = row.children();
            var clicked = cells.filter('.clicked');
            rowNumbersCode += RowToNumbers(clicked);
        });
        rowNumbers.html(rowNumbersCode).removeClass('empty');
        var columnNumbersCode = '';
        var columnsLen = griddler.children().eq(0).children().length;
        for(var i=0; i < columnsLen; i++ ) {             
            columnNumbersCode += ColumnToNumbers(griddler.find('div.cell:nth-child('+(i+1)+')').filter('.clicked'));
        }
        columnNumbers.html(columnNumbersCode).removeClass('empty').css('margin-left',rowNumbers.outerWidth());
    }
    function ClearNumbers(){
        columnNumbers.html('').addClass('empty');
        rowNumbers.html('').addClass('empty');
    }
    $('button#submit').click(function(e){
        CreateGrid(rows[0].value,columns[0].value)
        e.preventDefault(); 
    });
    $('button#clear').click(function(e){
        griddler.find('.cell.clicked').removeClass('clicked');
        ClearNumbers();
        e.preventDefault();
    });
    $('button#invert').click(function(e){
        var clicked = griddler.find('.cell.clicked');
        griddler.find('.cell').addClass('clicked');
        clicked.removeClass('clicked')
        e.preventDefault();
    });
    $('button#invisibility').click(function(e){
        griddler.find('.clicked').removeClass('clicked');
        e.preventDefault(); 
    });
    griddler.on('mousedown touchstart', '.cell', function(e){
        var cell = $(this);
        if(!cell.hasClass('clicked')) {
            cell.addClass('clicked');
            currentColor = 1;
        }
        else {
            cell.removeClass('clicked');
            currentColor = 0;
        }
        e.preventDefault();
    }).on('mouseover', '.cell', function(){
        var cell = $(this);
        if(griddler.hasClass('dragged')) {
            if(currentColor == 1) {
                cell.addClass('clicked')
            }
            else {
                cell.removeClass('clicked');   
            }
        }
    }).mousedown(function(e){
        griddler.addClass('dragged');
        e.preventDefault();
    }).mouseup(function(){
        griddler.removeClass('dragged');
    }).on('touchstart', function(e){
         griddler.addClass('dragged');
    }).on('touchmove',function(e){
        var cell = $(document.elementFromPoint(e.originalEvent.touches[0].clientX, e.originalEvent.touches[0].clientY));
        cell.trigger('mouseover');
        e.preventDefault();
    }).on('touchend',function(e){
        griddler.removeClass('dragged') ;
    });

    $('button#export').click(function(e){
        codeTextarea.val(ExportGriddler());
        e.preventDefault(); 
    });
    $('button#import').click(function(e){
        if(codeTextarea[0].value != '')
            ImportGriddler();
        e.preventDefault();
    });
    $('button#generate-numbers').click(function(e){
        GenerateNumbers();
        e.preventDefault();
    });

});