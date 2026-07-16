/*************************************************************************
 * NEUverse Dashboard — Google Apps Script Web App (Code.gs)
 * =======================================================================
 * Menghubungkan spreadsheet "raw data" dengan NEUverse Dashboard.
 *
 * Cara pakai singkat:
 *   1. Buka Google Sheet baru/lama → Extensions → Apps Script.
 *   2. Hapus isi default, tempel SELURUH file ini.
 *   3. Jalankan fungsi setup() sekali (membuat semua tab + header).
 *   4. Deploy → New deployment → Web app
 *        - Execute as     : Me
 *        - Who has access : Anyone
 *      Salin "Web app URL".
 *   5. Tempel URL itu ke dashboard: Simpan di file .env sebagai NEXT_PUBLIC_SCRIPT_API_URL
 *************************************************************************/

var SCHEMA = {
  rekrutmen:         ["posisi", "entitas", "kategori", "mulai", "selesai", "pct", "tahap", "catatan", "file_ol", "karyawan", "media", "deadline", "lokasi"],
  kritis:            ["id", "posisi", "entitas", "prioritas", "deadline", "catatan", "created"],
  clients_b2bint:    ["id", "nama", "layanan", "nilai", "pic", "status"],
  pipeline_b2bint:   ["id", "nama", "layanan", "nilai", "pic", "stage", "prob", "score"],
  progres_b2bint:    ["id", "clientId", "fase", "keterangan", "tanggal", "status"],
  checklist_b2bint:  ["id", "clientId", "task", "date", "status", "link"],
  clients_b2bext:    ["id", "nama", "layanan", "nilai", "pic", "status"],
  pipeline_b2bext:   ["id", "nama", "layanan", "nilai", "pic", "stage", "prob", "score"],
  progres_b2bext:    ["id", "clientId", "fase", "keterangan", "tanggal", "status"],
  checklist_b2bext:  ["id", "clientId", "task", "date", "status", "link"],
  training_offline:  ["id", "nama", "tanggal", "tempat", "trainer", "peserta", "status"],
  training_online:   ["id", "nama", "tanggal", "tempat", "trainer", "peserta", "status"],
  kelas:             ["id", "nama", "kategori", "modul", "peserta", "targetPeserta", "modulLink", "progress", "status"],
  lms_fase:          ["id", "fase", "deskripsi", "target", "progress", "status"],
  lms_kendala:       ["id", "kendala", "prioritas", "pic", "deadline", "status"],
  trainer:           ["id", "nama", "bidang", "email", "hp", "sertifikasi", "materi", "status"],
  finance_rekap:     ["id", "divisi", "masuk", "keluar", "ket"],
  finance_cashflow:  ["id", "tanggal", "tipe", "kategori", "divisi", "nominal"],
  kas:               ["page", "id", "tgl", "ket", "jenis", "nominal", "auto", "autoTag", "clientId"],
  forecast:          ["bulan", "divisi", "target", "fc", "real", "catatan"],
  forecast_cost:     ["id", "vendor", "divisi", "jan", "feb", "mar", "apr", "mei", "jun", "jul", "agu", "sep", "okt", "nov", "des", "catatan"],
  mitigasi:          ["id", "tab", "kendala", "mitigasi", "solving", "pic", "deadline", "status", "created"],
  leads:             ["id", "nama", "kontak", "channel", "stage", "last", "est", "pic", "notes"],
  channel_cost:      ["id", "channel", "biaya"],
  content_tracking:  ["id", "minggu", "stage", "platform", "judul", "status", "link", "views", "engagement"],
  cap_trainer:       ["id", "nama", "kapasitas", "terpakai", "status"],
  staff_load:        ["id", "nama", "divisi", "aktivitas", "frekuensi", "tugas", "kapasitas", "kpi", "status"],
  nps:               ["id", "klien", "periode", "skor", "catatan"],
  feedback:          ["id", "tanggal", "client", "feedback", "sentimen", "tindak", "status"],
  documents:         ["id", "kode", "nama", "tipe", "entitas", "tanggal", "versi", "url"]
};

// Buat semua tab data + header (jalankan sekali di awal)
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Setup _config
  var configSheet = ss.getSheetByName("_config");
  if (!configSheet) {
    configSheet = ss.insertSheet("_config");
    configSheet.appendRow(["key", "value"]);
    var defaultConfig = [
      ["saldoAwal", 0],
      ["sheetLeadsUrl", ""],
      ["sheetCashUrl", ""],
      ["sheetAuto", false],
      ["idSeq", 1],
      ["kasIdSeq", 1],
      ["docSeq", 1],
      ["globalFilter", "all"],
      ["globalCostSeg", "all"],
      ["globalFilterBulan", "all"]
    ];
    defaultConfig.forEach(function(r) {
      configSheet.appendRow(r);
    });
  }

  // Setup tab data
  Object.keys(SCHEMA).forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    // Set headers
    sheet.getRange(1, 1, 1, SCHEMA[name].length).setValues([SCHEMA[name]]);
    sheet.setFrozenRows(1);
  });
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var responseData = {
      sheets: {},
      config: {}
    };

    // Load _config
    var configSheet = ss.getSheetByName("_config");
    if (configSheet) {
      var configRange = configSheet.getDataRange();
      var configValues = configRange.getValues();
      for (var i = 1; i < configValues.length; i++) {
        var key = configValues[i][0];
        var val = configValues[i][1];
        if (val === "true" || val === true) val = true;
        else if (val === "false" || val === false) val = false;
        else if (!isNaN(val) && val !== "") val = Number(val);
        responseData.config[key] = val;
      }
    }

    // Load each table in SCHEMA
    Object.keys(SCHEMA).forEach(function(name) {
      var sheet = ss.getSheetByName(name);
      if (!sheet) {
        responseData.sheets[name] = [];
        return;
      }

      var range = sheet.getDataRange();
      var values = range.getValues();
      var headers = values[0];
      var rows = [];

      for (var r = 1; r < values.length; r++) {
        var rowObj = {};
        var rowData = values[r];
        
        // Skip empty rows
        var hasContent = false;
        for (var c = 0; c < headers.length; c++) {
          var val = rowData[c];
          if (val !== undefined && val !== null && val !== "") {
            hasContent = true;
          }
        }
        if (!hasContent) continue;

        for (var c = 0; c < headers.length; c++) {
          var h = headers[c];
          if (!h) continue;
          
          var val = rowData[c];
          // Type coercion
          if (val === "true" || val === true) val = true;
          else if (val === "false" || val === false) val = false;
          else if (!isNaN(val) && val !== "" && typeof val !== "string") val = Number(val);
          else if (val instanceof Date) val = val.toISOString(); // Format Date to ISO string
          
          rowObj[h] = val;
        }
        rows.push(rowObj);
      }
      responseData.sheets[name] = rows;
    });

    return ContentService.createTextOutput(JSON.stringify({ ok: true, data: responseData }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var postData = JSON.parse(e.postData.contents);
    
    var sheets = postData.sheets;
    var config = postData.config;

    // Save _config
    if (config) {
      var configSheet = ss.getSheetByName("_config") || ss.insertSheet("_config");
      configSheet.clear();
      configSheet.appendRow(["key", "value"]);
      Object.keys(config).forEach(function(key) {
        configSheet.appendRow([key, config[key]]);
      });
    }

    // Save sheets
    if (sheets) {
      Object.keys(SCHEMA).forEach(function(name) {
        var rows = sheets[name];
        if (!rows) return;

        var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
        sheet.clear();
        
        var cols = SCHEMA[name];
        sheet.appendRow(cols); // header
        sheet.setFrozenRows(1);

        if (rows.length > 0) {
          var values = rows.map(function(r) {
            return cols.map(function(c) {
              var v = r[c];
              if (v === undefined || v === null) return "";
              if (typeof v === "boolean") return v ? "true" : "false";
              return v;
            });
          });
          sheet.getRange(2, 1, values.length, cols.length).setValues(values);
        }
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
