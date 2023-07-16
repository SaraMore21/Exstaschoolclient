import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import jsPDF from 'jspdf';
import * as $ from 'jquery';
import * as html2pdf from 'html2pdf.js'

@Component({
  selector: 'app-editor',
  // template: `<select #selectElem>
  // <option *ngFor="#item of items" [value]="item" [selected]="item === selectedValue">{{item}} option</option>
  // </select>
  // <h4> {{selectedValue}}</h4>`
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})

export class EditorComponent implements OnInit {

  // @ViewChild('selectElem') el: ElementRef;
  // items = ['First', 'Second', 'Third'];
  // selectedValue = 'Second';

  // ngAfterViewInit() {
  //     $(this.el.nativeElement)
  //         .chosen()
  //         .on('change', (e, args) => {
  //             this.selectedValue = args.selected;
  //         });
  // }

  constructor() { }

  ngOnInit(): void {
  }

  //   $.ajax({
  //     url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('RequisitionOrders')/Items(" + GetUrlKeyValue("itemid") + ")?$select=*&$expand=RequisitionedBy&$select=RequisitionedBy/Title,RequisitionedBy/ID",
  //       method: "GET",
  //         async: false,
  //           headers: {
  //   "Accept": "application/json;odata=verbose"
  // },
  // success: function(data) {
  //   //Get all Items Start
  //   $(data.d).each(function (cos, currentRow) {
  //     $scope.OrderFromId = currentRow.ID;
  //     $scope.OrderFrom = currentRow.OrderFrom;
  //     $scope.PONumber = currentRow.PONumber;
  //     $scope.ConfirmedTo = currentRow.ConfirmedTo;
  //     $scope.Facility = currentRow.Facility;
  //     $scope.DateRequired = currentRow.DateRequired;
  //     $scope.ShipVia = currentRow.ShipVia;
  //     $scope.RequisitionedBy = currentRow.RequisitionedBy.Title;
  //     $scope.DeliverTo = currentRow.DeliverTo;
  //     $scope.RequisitionDate = currentRow.RequisitionDate;
  //     $scope.MaterialFor = currentRow.MaterialFor;
  //   })
  // },
  // error: function(sender, args) {
  //   console.log(args.get_message());
  // }
  // });

  savePdfSample() {
    var pdf = new jsPDF('p', 'pt', 'letter');
    var canvas = pdf.canvas
    canvas.height = 72 * 15;
    canvas.width = 72 * 15;
    var html = $("#PdfDiv").html();
    var options = {
      pagesplit: true
    };
    // html2pdf(html, pdf, function (pdf) {
    //   pdf.save('RequisationForm.pdf');
    // });
    html2pdf().from(html).set(options).save();
  }
}
