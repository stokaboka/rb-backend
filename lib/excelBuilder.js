/**
 * Created by stokaboka on 08.06.2016.
 */

api.excelBuilder = {};

api.excelBuilder.createHeader = function(p_worksheet, p__c_row, p___r_ab, p_value, p_style){
    var __c_row_str = p__c_row.toString();
    p_worksheet.mergeCells('A' + __c_row_str + ':' + p___r_ab + __c_row_str);
    var __cell_header = p_worksheet.getCell('A'+__c_row_str);
    __cell_header.value = p_value;
    __cell_header.alignment = p_style.alignment;
    __cell_header.font = p_style.font;
};

api.excelBuilder.dataToXLSX = function(__client, __callback){
    if(__client.context.data.error){
        __client.context.data.error_excel = 'QUERY ERROR';
        __callback();
    }else {

        var __client_data = JSON.parse(__client.data);
        var Excel = api.exceljs;
        var workbook = new Excel.Workbook();

        var __now = new Date();
        var __file_id = __client_data.table + '_' + __now.getTime();
        var __file_name = __file_id + '.xlsx';
        var __file_path = __client.pathDir+'../../../';
        var __file_path = __file_path + application.config.rb.path.xlsx;

        var __title_1_font = {size: 12, bold: true };
        var __title_1_aligment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        var __title_2_font = {size: 12};
        var __title_2_aligment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        var __title_3_font = {size: 10};
        var __title_3_aligment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        var __grid_line = 'thin';
        var __separator_line = 'double';

        var __cell_title_font  = {size: 10, bold: true };
        var __cell_title_aligment = { vertical: 'middle', horizontal: 'center', wrapText: true};
        var __cell_title_border = {
            top: {style:__grid_line},
            left: {style:__grid_line},
            bottom: {style:__separator_line},
            right: {style:__grid_line}
        };

        var __date_format = 'DD.MM.YYYY';

        var __cell_font = {size: 10};
        var __cell_border = {
            top: {style:__grid_line},
            left: {style:__grid_line},
            bottom: {style:__grid_line},
            right: {style:__grid_line}
        };
        var __cell_text_aligment = { vertical: 'top', horizontal: 'left', wrapText: true};
        var __cell_number_aligment = { vertical: 'top', horizontal: 'right'};
        var __cell_date_aligment = { vertical: 'top', horizontal: 'right'};

        var __max_text_width = 100;
        var __min_column_width = 10;

        var __start_row = 2;
        var __c_row = __start_row;

        workbook.creator = 'RedButton:ExcelBuilder generator based on exceljs: https://github.com/guyonroche/exceljs. Igor Khorev, mailto:igorhorev@gmail.com';
        workbook.lastModifiedBy = workbook.creator;
        workbook.created = __now;
        workbook.modified = __now;

        var worksheet = workbook.addWorksheet(__client_data.table);

        if(typeof __client_data.columns_obj == 'undefined') {
            __client_data.columns_obj = __client_data.columns.split(',');
            __client_data.columns_obj = api._.map(__client_data.columns_obj, function (___item) {
                ___item = ___item.toUpperCase().trim();
                return {
                    key: ___item,
                    width: 12,
                    db_type: 'STRING',
                    db_name: ___item
                }
            });
        }

        /**
         * prepare columns
         */
        api._.each(__client_data.columns_obj, function (___column) {
            var __width = __min_column_width;
            //var __format
            switch (___column["db_type"]){
                case 'INT' :
                case 'NUMBER' :
                    break;
                case 'STRING' :
                case 'TEXT' :
                    break;
                case 'DATE' :
                    __width = 12;
                    break;
                default:
            }
            ___column["key"] = ___column.db_name;
            ___column["width"] = __width;
            ___column["test_width"] = __min_column_width;
        })

        /**
         * alphabet index for cell merge
         */
        var ___r_ab = api.toolsBuilder.numberToAlphaBets(__client_data.columns_obj.length-1);

        /**
         * headers
         */
        api.excelBuilder.createHeader(worksheet, __c_row++, ___r_ab, __client_data.title, {alignment: __title_1_aligment, font: __title_1_font});

        if(__client_data.filter_description) {
            api.excelBuilder.createHeader(worksheet, __c_row++, ___r_ab, "Фильтр: " + __client_data.filter_description, {
                alignment: __title_2_aligment,
                font: __title_2_font
            });
        }

        api.excelBuilder.createHeader(worksheet, __c_row++, ___r_ab, "дата, время формирования файла: " + api.moment(__now).format('DD.MM.YYYY HH:mm'), {alignment: __title_3_aligment, font: __title_3_font});

        /**
         * table header
         */
        var ___row = worksheet.getRow(++__c_row);
        var __c_col = 0;
        api._.each(__client_data.columns_obj, function (___column) {
            var ___cell = ___row.getCell(++__c_col);
            ___cell.value = ___column.title;
            ___cell.font = __cell_title_font;
            ___cell.border = __cell_title_border;
            ___cell.alignment = __cell_title_aligment;
        });


        /**
         * table content
         */
        api._.each(__client.context.data.result, function (___data_row) {
            var __c_col = 0;
            var ___row = worksheet.getRow(++__c_row);
            if(___row) {
                api._.each(__client_data.columns_obj, function (___column) {
                    var ___cell = ___row.getCell(++__c_col);
                    if (___cell) {
                        var ___value = ___data_row[___column.db_name];
                        if(!___value){
                            ___value = " ";
                        }

                        switch (___column.db_type){
                            case 'INT' :
                            case 'NUMBER' :
                                ___cell.alignment = __cell_number_aligment;
                                break;
                            case 'STRING' :
                            case 'TEXT' :
                                var ___l = ___value.toString().length;
                                ___column.test_width = ___column.test_width < ___l ? ___l : ___column.test_width;
                                ___cell.alignment = __cell_text_aligment;
                                break;
                            case 'DATE' :
                                ___cell.alignment = __cell_date_aligment;
                                var ___dtmp = api.moment(___value, 'YYYY-MM-DDTHH:mm:ssZ');
                                if(___dtmp.isValid()){
                                    ___value = ___dtmp.format(__date_format);
                                }
                                break;
                            default:
                        }

                        ___cell.value = ___value;
                        ___cell.font = __cell_font;
                        ___cell.border = __cell_border;
                    }
                });
            }
        });

        api._.each(__client_data.columns_obj, function (___column) {
            switch (___column.db_type){
                case 'STRING' :
                case 'TEXT' :
                    ___column.width = ___column.test_width > __max_text_width ? __max_text_width : ___column.test_width;
                    break;
                case 'DATE' :
                case 'INT' :
                case 'NUMBER' :
                    ___column.width = ___column.width  + 5;
                default:
            }
        });

        worksheet.columns = __client_data.columns_obj;

        workbook.xlsx.writeFile(__file_path + __file_name)
            .then(function() {
                __client.context.data.xlsx_file_name = __file_name;
                __client.context.data.xlsx_file_path = __file_path;
                __client.context.data.xlsx_file_id = __file_id;
                __callback();
            });
    }
};