function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var result = [];

  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    result.push(obj);
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}


// 在 GAS 編輯器中執行這個，而不是放在 doGet 裡
function updateGeocodes() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    var address = data[i][1]; // 假設地址在第 2 欄
    var lat = data[i][5];     // 假設 lat 在第 6 欄
    
    // 如果沒有經緯度才執行 geocode
    if (!lat) {
      try {
        var response = Maps.newGeocoder().geocode(address);
        if (response.results.length > 0) {
          var result = response.results[0].geometry.location;
          sheet.getRange(i + 1, 6).setValue(result.lat); // 存回 lat
          sheet.getRange(i + 1, 7).setValue(result.lng); // 存回 lng
          
          // 重要：暫停一秒，符合 Google 限制
          Utilities.sleep(1000); 
        }
      } catch (e) {
        console.error("地址轉換失敗: " + address);
      }
    }
  }
}