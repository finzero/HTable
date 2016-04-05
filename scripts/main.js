var
    $$ = function(id) {
      return document.getElementById(id);
    },
    container = $$('example1'),
    exampleConsole = $$('example1console'),
    autosave = $$('autosave'),
    load = $$('load'),
    save = $$('save'),
    del = $$('delete'),
    autosaveNotification,
    hot;

  hot = new Handsontable(container, {
    startRows: 8,
    startCols: 6,
    rowHeaders: true,
    colHeaders: true,
    outsideClickDeselects: false,
    filters: true,
    // dropdownMenu: ['filter_by_condition', 'filter_action_bar'],
    dropdownMenu: true,
    minSpareRow: 2,
    afterChange: function (change, source) {
      if (source === 'loadData') {
        return; //don't save this change
      }
      if (!autosave.checked) {
        return;
      }
      clearTimeout(autosaveNotification);
      console.info(change);
      $.ajax({
      	url:'scripts/json/save.json', 
      	type: 'POST', 
      	data : JSON.stringify({data: change}), 
      	success : function (data) {
	        exampleConsole.innerText  = 'Autosaved (' + change.length + ' ' + 'cell' + (change.length > 1 ? 's' : '') + ')';
	        autosaveNotification = setTimeout(function() {
	          exampleConsole.innerText ='Changes will be autosaved';
	        }, 1000);
	      }
	    });
    },
    afterRender: function(){
      render_color(this);
    },
    afterChange: function(changes, source){
      console.log('afterChange',changes);
      console.log('sources',source);
      if(source == 'paste'){
        this.setDataAtCell(changes[0][0], 0, null, 'id');
      }
    }
  });

  function render_color(hot){
    for(var r=0;r<hot.countRows();r++){
      for(var c=0;c<hot.countCols();c++){
        cell_color = hot.getDataAtRow(r)[5];
        $(hot.getCell(r,c)).css({"background-color": cell_color})
      }
    }
  }

  // hide loader
  $("#loader").addClass('hide');
  var loadData = function(ele){
    $("#loader").removeClass('hide');
    $("#example1").addClass('hide');

  	var table = $( ele ).attr( "target-data" );
  	$.ajax({
    	url : 'scripts/json/'+table,
    	type:'GET',
    	dataType: 'json',
    	success : function(res) {
	      var data = res;
        // console.log(data)
        hot.loadData(data.data);
        hot.updateSettings({
          colHeaders: ['id', 'car', 'type', 'date','price','color'],
          columnSorting : true
        })
	      exampleConsole.innerText = 'Data loaded';

        $("#example1").removeClass('hide');
    	  $("#loader").addClass('hide');
      },
    	error : function(res, status) {
	      console.warn(res,status);    	
	    }
    });
  }

  Handsontable.Dom.addEvent(del, 'click', function() {
    // save all cell's data
    var tempID = null;
    var sel = hot.getSelected();
    // var data = [ [sel[0],sel[1]] ];
    for(row=sel[0]; row<=sel[2]; row++){
      // for(col=sel[1]; col<=sel[3]; col++){
        // console.log(row, col);
        if(tempID != row){
          tempID = row;
          var selectedData = hot.getSourceData()[row][0]; 
          alert('selectedData id : '+selectedData);
        }
      // }
    }
    // alert('You select\n startRow: '+ sel[0] +', startCol '+ sel[1] +', endRow '+ sel[2] +', endCol '+sel[3]+'\n'+' You\'re going to delete: '+selectedData );
  });

  Handsontable.Dom.addEvent(save, 'click', function() {
    // save all cell's data
    $.ajax({
    	url: 'scripts/json/save.json',
    	type: 'POST', 
    	data: JSON.stringify({data: hot.getData()}), 
    	success: function (res) {
	      var response = JSON.parse(res.response);

	      if (response.result === 'ok') {
	        exampleConsole.innerText = 'Data saved';
	      }
	      else {
	        exampleConsole.innerText = 'Save error';
	      }
	    } 
	  });
  });

  Handsontable.Dom.addEvent(autosave, 'click', function() {
    if (autosave.checked) {
      exampleConsole.innerText = 'Changes will be autosaved';
    }
    else {
      exampleConsole.innerText ='Changes will not be autosaved';
    }
  });