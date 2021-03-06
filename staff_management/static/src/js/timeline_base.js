openerp_staff_management_timeline_base = function(instance) {
	var _t = instance.web._t;

	instance.staff_management.Timeline = instance.web.View.extend({
	
		template: "staff_timeline",
		
		init:function(parent, dataset, view_id, options){
			this._super.apply(this, arguments);			
		},
		
		destroy:function(){
			this._super();
		},
		
		format_date: function(date, format){
			return $.fullCalendar.formatDate(date, format, {
				monthNames: Date.CultureInfo.monthNames,
				monthNamesShort: Date.CultureInfo.abbreviatedMonthNames,
				dayNames: Date.CultureInfo.dayNames,
				dayNamesShort: Date.CultureInfo.abbreviatedDayNames,
			});
		},

		// Format number for hour
		FormatNumberLength: function(num, length) {
			var r = "" + num;
			while (r.length < length) {
				r = "0" + r;
			}
			return r;
		},
	
		// convert hour from 9.5 to 09:30
		format_hour: function(hour){
			hour = parseFloat(hour);
			if(hour == undefined || isNaN(hour)){
				return '00:00';
			}
			var h = Math.floor(hour);          
			var m = Math.round((hour-h) * 60);
			return this.FormatNumberLength(h, 2)+':'+this.FormatNumberLength(m, 2);
		},
		
		format_hour_duration: function(hour_start, hour_end){
			hour_start = parseFloat(hour_start);
			hour_end = parseFloat(hour_end);
			if(isNaN(hour_start)){
				hour_start = 0;
			}
			if(isNaN(hour_end)){
				hour_end = 0;
			}
			return this.format_hour(hour_end-hour_start);
		},

		get_week_start: function(date){
			var d = new Date(date);
			if(d.getDay() == 0 && Date.CultureInfo.firstDayOfWeek > 0){
				d.setDate(d.getDate()-7);
			}
			return new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay() + Date.CultureInfo.firstDayOfWeek);
		},

		view_loading: function (fv) {
			var self = this;
			$('.fc-header-left .fc-button').hover(
				function () {
					$(this).addClass('fc-state-hover');
				}, 
				function () {
					$(this).removeClass('fc-state-hover');
				}
			);
			this.set_button_actions();
		},

		set_button_actions: function() {
			var self = this;
			$('.fc-button-prev-month').click(function(){
				var firstday = new Date(self.range_stop.getFullYear(), self.range_stop.getMonth() - 1, 1);
				firstday = self.get_week_start(firstday);
				var lastday = new Date(firstday.getFullYear(), firstday.getMonth(), firstday.getDate() + 6);
				self.update_range_dates(firstday, lastday);
			});
			$('.fc-button-next-month').click(function(){
				var firstday = new Date(self.range_stop.getFullYear(), self.range_stop.getMonth() + 1, 1);
				firstday = self.get_week_start(firstday);
				var lastday = new Date(firstday.getFullYear(), firstday.getMonth(), firstday.getDate() + 6);
				self.update_range_dates(firstday, lastday);
			});

			$('.fc-button-prev-week').click(function(){
				var firstday = new Date(self.range_start.getFullYear(), self.range_start.getMonth(), self.range_start.getDate() - 7);
				var lastday = new Date(firstday.getFullYear(), firstday.getMonth(), firstday.getDate() + 6);
				self.update_range_dates(firstday, lastday);
			});
			$('.fc-button-next-week').click(function(){
				var firstday = new Date(self.range_start.getFullYear(), self.range_start.getMonth(), self.range_start.getDate() + 7);
				var lastday = new Date(firstday.getFullYear(), firstday.getMonth(), firstday.getDate() + 6);
				self.update_range_dates(firstday, lastday);
			});

			$('.fc-button-today').click(function(){
				if(!$(this).hasClass('fc-state-disabled')){
					var now = new Date();
					var firstday = self.get_week_start(now);
					var lastday = new Date(firstday.getFullYear(), firstday.getMonth(), firstday.getDate() + 6);
					self.update_range_dates(firstday, lastday);
				}
			});
		},

		/*
			interval_mode: day | month | year
			interval_nbr: nbr of day, month or year to add by step
		*/
		set_interval: function(interval_mode, interval_nbr){
			this.interval_mode = interval_mode;
			this.interval_nbr = interval_nbr;
		},
		
		/*
			datas = [{
				 'cells': [event_data],
				 'lineID': lid,
				 'username': e['user_id'][1],
			 };
		*/
		update_datas: function(datas){
			this.datas = datas;
			this.render_timeline();
		},
		
		set_nbrOfHeaderLines: function(nbrOfHeaderLines){
			this.nbrOfHeaderLines = nbrOfHeaderLines;
		},

		set_nbrOfRightCells: function(nbrOfRightCells){
			this.nbrOfRightCells = nbrOfRightCells;
		},

		set_nbrOfFooterLines: function(nbrOfFooterLines){
			this.nbrOfFooterLines = nbrOfFooterLines;
		},
		
		set_range_dates: function(date_start, date_stop) {
			this.range_start = new Date(date_start);
			this.range_stop = new Date(date_stop);
		},
		
		do_search: function(domain, context, _group_by) {
			this.lastSearch = {
				'domain': domain,
				'context': context,
				'_group_by': _group_by
			};
		},

		update_range_dates: function(date_start, date_stop) {
			this.set_range_dates(date_start, date_stop);
			this.do_search(this.lastSearch.domain, this.lastSearch.context, this.lastSearch._group_by);
		},
		
		getNextDate: function(date, index){
			var index = (typeof index === "undefined") ? 1 : index;

			var d = new Date(date.getTime());
			if(this.interval_mode == 'day'){
				d.setDate(d.getDate() + this.interval_nbr * index);
			}
			else if(this.interval_mode == 'month'){
				d.setMonth(d.getMonth() + this.interval_nbr * index);
			}
			else if(this.interval_mode == 'year'){
				d.setFullYear(d.getFullYear() + this.interval_nbr * index);
			}
			return d;
		},
		
		isSameDate: function(d1, d2){
			var format = "yyyy-MM-dd";
			if(this.interval_mode == 'month'){
				format = "yyyy-MM";
			}
			else if(this.interval_mode == 'year'){
				format = "yyyy";
			}
			var d1_str = $.fullCalendar.formatDate(d1, format);
			var d2_str = $.fullCalendar.formatDate(d2, format);
			return (d1_str == d2_str);
		},

		refresh_events: function(){
			this.do_search(this.lastSearch.domain, this.lastSearch.context, this.lastSearch._group_by);
		},
		/*
		refresh_event: function(lineID, eventList, date){
			// replace eventlist in datas
			var data = this.datas[i];
			var colNumber = 0;
			for(var cdate=this.range_start ; cdate<=this.range_stop ; cdate=this.getNextDate(cdate)){
				colNumber ++;
				for(var j=0 ; j<data['cells'].length ; j++){
					if(this.isSameDate(data['cells'][j]['date'], cdate)){
						this.datas[i]['cells'][j] = eventList;
					}
				}
			}

			// refresh event view
			var lineNumber = this.lineIndex.indexOf(lineID);
			var tr = $('.stimeline_table table tbody tr').item(lineNumber);
			var td = tr.find('td').item(colNumber);

			td.empty();
			td.append('BOOM');
		},
		*/

		getLineData: function(trElement){
			var lineID = this.lineIndex[parseInt(trElement.index())];
			return this.datas[lineID];
		},

		render_timeline: function(){
			var self = this;

			var today = new Date();
			today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
			if(this.range_start <= today && today <= this.range_stop){
				$('.fc-button-today').addClass('fc-state-disabled');
			}
			else{
				$('.fc-button-today').removeClass('fc-state-disabled');
			}

			var titleElmt = $('.fc-header-title h2');
			this.renderTitle(titleElmt, this.range_start, this.range_stop);
			
			var table = $('<table>').attr('width', '100%');
			var thead = $('<thead>');
			var tbody = $('<tbody>');
			var tfoot = $('<tfoot>');
			
			thead = this.header_rendering(thead);
			tbody = this.body_rendering(tbody);
			tfoot = this.footer_rendering(tfoot);
						
			table.append(thead);
			table.append(tbody);
			table.append(tfoot);


			table.find('td').click(function(){

				var i = $(this).parent().index();
				var lineID = self.lineIndex[parseInt($(this).parent().index())];
				var date = self.getNextDate(self.range_start, parseInt($(this).index())-1);

				var data = self.datas[lineID];
				var cellDataList = [];
				for(var j=0 ; j<data['cells'].length ; j++){
					if(self.isSameDate(data['cells'][j]['date'], date)){
						cellDataList.push(data['cells'][j]);
					}
				}
				self.cellClicked(lineID, date, cellDataList);
			});

			$('.stimeline_table').empty();
			$('.stimeline_table').append(table);
			
			this.final_table_rendering(table);
		},
		
		header_rendering: function(thead){
			
			for(var lineID=1 ; lineID<=this.nbrOfHeaderLines ; lineID ++){
				
				var tr = $('<tr>');
				if(lineID == 1){
					tr.addClass('firstHeaderLine');
				}
				if(lineID == this.nbrOfHeaderLines){
					tr.addClass('lastHeaderLine');
				}
				var th = $('<th>').addClass('stimeline_leftcol');
				th = this.renderHeaderCellLeft(th, lineID);
				tr.append(th);
				
				for(var cdate=this.range_start ; cdate<=this.range_stop ; cdate=this.getNextDate(cdate)){
					var th = $('<th>');
					
					th = this.renderHeaderCell(th, lineID, cdate);
					
					tr.append(th);
				}
				
				if(this.nbrOfRightCells){
					for(var i=1; i<=this.nbrOfRightCells; i++){
						var th = $('<th>');
						th = this.renderHeaderCellRight(th, lineID, i);
						tr.append(th);
					}
				}

				thead.append(tr);
				
			}
			return thead;
		},
		
		body_rendering: function(tbody){
			var self = this;
			var line_nbr = 0;
			
			this.lineIndex = [];

			for(var i in this.datas){
				this.lineIndex .push(i);
				var data = this.datas[i];
				line_nbr ++;
				
				var tr = $('<tr>');
				var th = $('<th>').addClass('stimeline_leftcol');
				th = this.renderCellLeft(th, data);
				tr.append(th);
				
				for(var cdate=this.range_start ; cdate<=this.range_stop ; cdate=this.getNextDate(cdate)){
					var td = $('<td>');
					
					var cellDataList = [];
					for(var j=0 ; j<data['cells'].length ; j++){
						if(this.isSameDate(data['cells'][j]['date'], cdate)){
							cellDataList.push(data['cells'][j]);
						}
					}
					
					td = this.renderCell(td, cellDataList, cdate);
					
					tr.append(td);
				}
				
				if(this.nbrOfRightCells){
					for(var i=1; i<=this.nbrOfRightCells; i++){
						var td = $('<td>');
						td = this.renderCellRight(td, i, data);
						tr.append(td);
					}
				}
				
				tbody.append(tr);
				
			}
			
			this.line_number = line_nbr;
			
			return tbody;
		},

		footer_rendering: function(tfoot){
			if(this.nbrOfFooterLines && this.nbrOfFooterLines > 0){

				for(var lineID=1 ; lineID<=this.nbrOfFooterLines ; lineID ++){
					
					var tr = $('<tr>');
					if(lineID == 1){
						tr.addClass('firstFooterLine');
					}
					if(lineID == this.nbrOfFooterLines){
						tr.addClass('lastFooterLine');
					}
					var th = $('<th>').addClass('stimeline_leftcol');
					th = this.renderFooterCellLeft(th, lineID);
					tr.append(th);
					
					for(var cdate=this.range_start ; cdate<=this.range_stop ; cdate=this.getNextDate(cdate)){
						var td = $('<td>');
						td = this.renderFooterCell(td, lineID, cdate);						
						tr.append(td);
					}
					
					if(this.nbrOfRightCells){
						for(var i=1; i<=this.nbrOfRightCells; i++){
							var td = $('<td>');
							td = this.renderFooterCellRight(td, lineID, i);
							tr.append(td);
						}
					}

					tfoot.append(tr);
					
				}

			}
			return tfoot;
		},
		
		final_table_rendering: function(table){
		
			var viewHeight = $('.openerp_webclient_container').height() - $('.announcement_bar').height() - $('.oe_topbar').height() - $('.oe_view_manager_header').height();
			
			
			var tableHeight = viewHeight - $('.stimeline_header').height();
			
			var tbodyHeight = tableHeight - $('.stimeline_table thead').height() - $('.stimeline_table tfoot').height() - 10;
			
			width = $(window).width() - $('.oe_leftbar').width() - 1;
			$('.salary_timeline').css({
				'width': width,
			});
		
			table.dataTable({
				"searching": false,
				"info": false,
				"paging":   false,
				"order": [[ 0, "asc" ]],
				"scrollY": tbodyHeight,
				"scrollX": true,
				"language": {
					"emptyTable":     _t("No data available"),
				},
				"bSortCellsTop": true
			});	
			
			var realTbodyHeight = $('.stimeline_table tbody').height();
			if(realTbodyHeight < tbodyHeight){
				nbrLines = (this.line_number == 0) ? 1 : this.line_number;
				var tr_height = tbodyHeight / nbrLines - 2;
				$('.stimeline_table tbody tr').each(function(i, e){
					$(e).height(tr_height);
				});	
			}

			this.align_cols();
			
		},
		
		align_cols: function(){
			
			var head_tr = $('.stimeline_table .dataTables_scrollHeadInner thead tr'); // get the clone from datatable displayed
			var body_tr = $('.stimeline_table tbody tr');
			var foot_tr = $('.stimeline_table .dataTables_scrollFootInner tfoot tr'); // get the clone from datatable displayed
			
			var tds_head = head_tr.find('th, td');
			var tds_body = body_tr.find('th, td');
			var tds_foot = foot_tr.find('th, td');
						
			nbr_tds = tds_head.length;

			for(var i=1 ; i<nbr_tds ; i++){
				var maxWidth = tds_head.eq(i).width();
				if(tds_body.eq(i).width() > maxWidth){
					maxWidth = tds_body.eq(i).width();
				}
				if(tds_foot.eq(i).width() > maxWidth){
					maxWidth = tds_foot.eq(i).width();
				}
				
				maxWidth += 2;

				tds_head.eq(i).css({'width': maxWidth, 'min-width': maxWidth, 'max-width': maxWidth});
				tds_body.eq(i).css({'width': maxWidth, 'min-width': maxWidth, 'max-width': maxWidth});
				tds_foot.eq(i).css({'width': maxWidth, 'min-width': maxWidth, 'max-width': maxWidth});
				//tds_foot.eq(i).width(maxWidth);
				
			}
			
		},
		
		
		
	});

};
