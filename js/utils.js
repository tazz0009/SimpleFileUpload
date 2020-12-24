//auiGrid 카렌더 타이틀
var auigridDateTitles = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

//auiGrid 카렌더 Month 출력 포맷
var auigridDateMonthTitleString = "mmm";

//auiGrid 카렌더 Month 출력 포맷
var auigridDateFormatMonthString = "yyyy mmm";

//auigrid 카렌더 Year 출력 포맷
var auigridDateFormatYearString = "yyyy";

/**
 * 공통 유틸리티 스크립트
 */

/******************************************** 공통 유틸리티 함수 Start ****************************************************/

/**
 * form 내의 파라미터를 serializing 한 후 객체로 리턴
 */
function g_getFormParam(formId, addParams) {
  formId = formId || "#frmSearch";
  addParams = addParams || {};
  return getMergedObject($(formId).serializeObject(), addParams);
}

/**
 * json 또는 json-array 데이터를 공통데이타셋 형식으로 변경
 */
function g_getDataset(data, rowStatus) {
  rowStatus = rowStatus || "I";
  var ret = {};
  ret["data"] = [];
  ret["deletedData"] = [];

  if ($.isArray(data)) {
    if (data.length > 0) {
      if (g_isNull(data[0].__rowStatus)) {
        for (var i = 0; i < data.length; i++) {
          data[i].__rowStatus = rowStatus;
        }
      }
      ret["data"] = data;
    }
  } else {
    if (g_isNull(data.__rowStatus)) {
      data.__rowStatus = rowStatus;
    }
    ret["data"].push(data);
  }

  return ret;
}

/**
 * json-array 데이터의 특정 필드값을 지정된 값으로 설정
 * @param data (array) : json array
 * @param defaultSet (object) : 지정할 필드값
 * @ex
    g_setDatasetDefault(ds.ds_payCostPoly.data, [
		{ key: 'ETC_TAX_USE_YN', val: '1' }
        ,{ key: 'APL_TAX_RT', val:
            function(val) {
                return g_toNum(val) != 0 ? (val / 100) : val;
            }
        }
	]);
 */
function g_setDatasetDefault(data, defaultSet) {
  if ($.isArray(data)) {
    $.each(data, function (idx, rowItem) {
      $.each(defaultSet, function (idx2, setItem) {
        var key = setItem.key;
        if ($.isFunction(setItem.val)) {
          rowItem[key] = setItem.val.call(this, rowItem[key]);
        } else {
          rowItem[key] = g_nvl(rowItem[key], setItem.val);
          //log('g_setDatasetDefault: ', setItem, key, rowItem[key]);
        }
      });
    });
  }
}

/**
 * 문자열로 변환,undefined or null이면 ""로 초기화
 */
function g_toStr(str, dfVal) {
  dfVal = dfVal || "";
  if (
    typeof str == "undefined" ||
    str == "undefined" ||
    str == null ||
    str == "null"
  ) {
    str = dfVal;
  }
  return String(str);
}

/**
 * 숫자로 변환. 숫자가 아니면 지정된값으로 초기화
 */
function g_toNum(num, dfVal) {
  dfVal = dfVal || 0;
  num = g_toStr(num).replaceAll(",", "");
  if ($.isNumeric(num)) {
    num = parseFloat(num);
  } else {
    num = dfVal;
  }
  return num;
}

/**
 * undefined이거나 null인지 체크
 */
function g_isNull(v) {
  return typeof v == "undefined" || v == null;
}

/**
 * undefined, null을 지정값으로 치환
 */
function g_nvl(v1, v2) {
  if (g_isNull(v1)) {
    if (g_isNull(v2)) {
      return "";
    } else {
      return v2;
    }
  }
  return v1;
}

/**
 * v1===v2 이면 newVal값 리턴
 */
function g_iif(v1, v2, newVal) {
  return v1 === v2 ? newVal : v1;
}

/**
 * 문자열 포맷팅
 */
function g_stringFormat() {
  var args = arguments[0];

  if (args != null) {
    for (var i = 1; i < arguments.length; i++) {
      var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
      args = args.replace(regEx, arguments[i]);
    }
  }

  return args;
}

/**
 * json data groupBy
 */
function g_groupBy(data, predicate) {
  var grouped = {};
  for (var i = 0; i < data.length; i++) {
    var groupKey = predicate(data[i]);
    if (typeof grouped[groupKey] === "undefined") {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(data[i]);
  }

  return grouped;
}

/**
 *  특정 키값으로 sum 계산
 */
function g_sumBy(data, key) {
  var sum = 0;
  for (var i = 0; i < data.length; i++) {
    sum += g_toNum(data[i][key]);
  }

  return sum;
}

/**
 * json array에서 특정 컬럼값을 검색하여 검색된 행을 배열로 리턴 (keys의 item갯수는 총 3개까지만 가능)
 * @param data (json array) : 검색할 데이터
 * @param keys (String or Array) : 컬럼명
 * @param vals (String or Array) : 검색할 값
 */
function g_grepData(data, keys, vals) {
  if (g_isNull(data)) return [];
  var ret;

  if ($.isArray(keys)) {
    if (keys.length == 1) {
      ret = $.grep(data, function (item, z) {
        return g_toStr(item[keys[0]]) == g_toStr(vals[0]);
      });
    } else if (keys.length == 2) {
      ret = $.grep(data, function (item, z) {
        return (
          g_toStr(item[keys[0]]) == g_toStr(vals[0]) &&
          g_toStr(item[keys[1]]) == g_toStr(vals[1])
        );
      });
    } else if (keys.length == 3) {
      ret = $.grep(data, function (item, z) {
        return (
          g_toStr(item[keys[0]]) == g_toStr(vals[0]) &&
          g_toStr(item[keys[1]]) == g_toStr(vals[1]) &&
          g_toStr(item[keys[2]]) == g_toStr(vals[2])
        );
      });
    } else if (keys.length == 4) {
      ret = $.grep(data, function (item, z) {
        return (
          g_toStr(item[keys[0]]) == g_toStr(vals[0]) &&
          g_toStr(item[keys[1]]) == g_toStr(vals[1]) &&
          g_toStr(item[keys[2]]) == g_toStr(vals[2]) &&
          g_toStr(item[keys[3]]) == g_toStr(vals[3])
        );
      });
    } else if (keys.length == 5) {
      ret = $.grep(data, function (item, z) {
        return (
          g_toStr(item[keys[0]]) == g_toStr(vals[0]) &&
          g_toStr(item[keys[1]]) == g_toStr(vals[1]) &&
          g_toStr(item[keys[2]]) == g_toStr(vals[2]) &&
          g_toStr(item[keys[3]]) == g_toStr(vals[3]) &&
          g_toStr(item[keys[4]]) == g_toStr(vals[4])
        );
      });
    }
  } else {
    ret = $.grep(data, function (item, z) {
      return g_toStr(item[keys]) == g_toStr(vals);
    });
  }

  return ret;
}

/**
 * Left string
 */
function g_left(str, n) {
  var str = g_toStr(str);
  if (n <= 0) {
    return "";
  } else if (n > str.length) {
    return str;
  } else {
    return str.substring(0, n);
  }
}

/**
 * Right string
 */
function g_right(str, n) {
  var str = g_toStr(str);
  var len = str.length;

  if (n <= 0) {
    return "";
  } else if (n > len) {
    return str;
  } else {
    return str.substring(len, len - n);
  }
}

/**
 *  줄바꿈문자를 <br/>로 변환
 */
function g_nl2br(str) {
  str = g_toStr(str);
  var breakTag = "<br/>";
  return (str + "").replace(
    /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
    "$1" + breakTag + "$2"
  );
}

/**
 *  <br/>을 줄바꿈문자로 변환
 */
function g_br2nl(str, replStr) {
  str = g_toStr(str);
  if (typeof replStr == "undefined") replStr = "\n";
  return (str + "").replace(/<br\s*[\/]?>/gi, replStr);
}

/**
 * <>을 특수문자로 변환
 */
function g_replaceTags(str) {
  str = g_toStr(str);
  str = str.replaceAll("<", "〈");
  str = str.replaceAll(">", "〉");
  return str;
}

/**
 * ajax sync 호출
 */
function g_ajaxSync(url, params, isLoad) {
  isLoad = isLoad || false;
  var result = $.ajax({
    type: "POST",
    dataType: "json",
    contentType: "application/json; charset=UTF-8",
    url: url,
    data: JSON.stringify(params),
    async: false,
    beforeSend: function (jqXHR, settings) {
      openLoadingImage({ pLoad: isLoad }); //로딩이미지 노출
    },
    complete: function (jqXHR, textStatus) {
      closeLoadingImage(); //로딩이미지 닫기
    },
  }).responseText;
  //log('g_ajaxSync: ', JSON.parse(result));

  var returnData;
  try {
    returnData = JSON.parse(result);
  } catch (e) {
    returnData = {
      ERROR_CODE: -1,
      ERROR_MESSAGE_CODE: "-1",
      ERROR_MESSAGE_TEXT: "",
    };
  }

  //ajax 응답객체로부터 수행결과코드 및 출력해 주어야할 메세지를 선별하여 리턴.
  var retMsg = getReturnMsg(returnData);
  //선별된 메세지를 타입에 맞추어 출력(alert or footer출력 등)
  outMessage(retMsg);

  //세션 만료시 : 권한없음 에러코드일 경우 에러페이지로 페이지 이동 ERR_CD_NO_AUTH : -10
  if (retMsg.errCd == ERR_CD_NO_AUTH) {
    goSessionExpiredPage({ alert: false }); //outMessage()에서 alert처리를 하므로 false로 셋팅
  }

  return returnData;
}

/**
 * 유효한 날짜형식인지 여부 리턴
 */
function g_isDateYmd(strDate) {
  strDate = g_fixDate(strDate);

  if (strDate.length != 8) {
    return false;
  }

  if (!moment(strDate, "YYYYMMDD").isValid()) {
    return false;
  }
  return true;
}

/**
 * 날짜형식 보정
 */
function g_fixDate(strDate) {
  strDate = g_toStr(strDate);
  if (strDate != "") {
    strDate = strDate
      .replaceAll("-", "")
      .replaceAll("/", "")
      .replaceAll(".", "");
  }

  return strDate;
}

/**
 * 두 날짜의 day/month/year 차이 리턴
 * @param strFrom : YYYYMMDD
 * @param strTo : YYYYMMDD
 * @param datePart : 'days', 'months', 'years'
 */
function g_dayDiff(strFrom, strTo, datePart) {
  strFrom = moment(g_fixDate(strFrom), "YYYYMMDD");
  strTo = moment(g_fixDate(strTo), "YYYYMMDD");

  var diff = g_toNum(strTo.diff(strFrom, g_nvl(datePart, "days")));
  //log('g_dayDiff: ', diff);

  return diff;
}

/**
 * 두 시간의 분 차이 리턴
 * @param strFrom : HHmm
 * @param strTo : HHmm
 * @param strDate : YYYYMMDD
 */
function g_minDiff(strFrom, strTo, strDate) {
  strDate = strDate || g_curYMD;

  if (g_toStr(strFrom) == "" || g_toStr(strTo) == "") {
    return null;
  }

  strFrom = moment(strDate + strFrom, "YYYYMMDDHHmm");
  strTo = moment(strDate + strTo, "YYYYMMDDHHmm");

  var diff = strTo.diff(strFrom, "minutes");
  //log('g_minDiff: ', diff);

  return diff;
}

/**
 * minites to HHmm
 * @param mins : 분
 */
function g_minToHHmm(mins) {
  mins = g_toNum(mins);
  var hours = mins > 0 ? g_toStr(Math.floor(mins / 60)) : "0";
  if (hours.length < 2) {
    hours = hours.lpad(2, "0");
  }
  var minutes = g_toStr(mins % 60).lpad(2, "0");

  //log('g_minToHHmm: ', mins, hours, minutes);
  return hours + minutes;
}

/*
 * 날짜포맷을 moment.js 포맷으로 변환
 */
function g_toMomentFormat(dateFmt, timeFmt) {
  var ret = "";

  if (dateFmt) {
    ret = dateFmt.toUpperCase();
  }
  if (timeFmt) {
    if (ret.length > 0) {
      ret = ret + " ";
    }
    ret = ret + timeFmt.replace(/MM/g, "mm").replace(/SS/g, "ss");
    if (timeFmt.indexOf(" tt") > -1 || timeFmt.indexOf(" TT") > -1) {
      // 12 hour time
      ret = ret.replace(/HH/g, "hh").replace(/tt/g, "a").replace(/TT/g, "A");
    } else {
      // 24 hour time
      ret = ret.replace(/hh/g, "HH");
    }
  }

  return ret;
}

/**
 * 날짜(년월일) 포맷팅
 * @ex g_formatDate('[날짜문자열]', '[문자열날짜포맷]', '[변환할문자열날짜포맷]')
 * @ex g_formatDate('20160913')
 * @ex g_formatDate('20160913', 'YYYYMMDD', 'YYYY-MM-DD')
 */
function g_formatDate(str, fromFmt, toFmt) {
  fromFmt = fromFmt || "YYYYMMDD";
  //toFmt = toFmt || curLOCALE_DATE_FORMAT_NM;
  toFmt = toFmt || g_localeOptions.dateFormat_nm.toUpperCase();
  //log('g_formatDate: ', str, fromFmt, toFmt);

  if (g_toStr(str) != "") {
    //var ret = moment(str, fromFmt).format(toFmt.toUpperCase());
    var ret = moment(str, fromFmt).format(toFmt);

    if (ret.indexOf("Invalid") != -1) {
      return str;
    }
  }

  return ret;
}

/**
 * 일시(년월일 시간분) 포맷팅
 * @ex g_formatDate('[일시문자열]', '[문자열일시포맷]', '[변환할문자열일시포맷]')
 * @ex g_formatDate('20160913010101')
 * @ex g_formatDate('20160913010101', 'YYYYMMDDHHmmss', 'YYYY-MM-DD HH:mm:ss')
 */
function g_formatDateTime(str, fromFmt, toFmt) {
  fromFmt = fromFmt || "YYYYMMDDHHmmss";
  toFmt =
    toFmt ||
    g_toMomentFormat(g_localeOptions.dateFormat_nm) +
      " " +
      g_toMomentFormat(null, g_localeOptions.timeFormat_nm);
  //log('g_localeOptions.formatDatetime: ', str, fromFmt, toFmt);
  var ret = "";

  if (g_toStr(str) != "") {
    ret = moment(str, fromFmt).format(toFmt);

    if (ret.indexOf("Invalid") != -1) {
      return str;
    }
  }

  return ret;
}

/*
 * 날짜(년월) 포맷팅
 * g_formatYYMM('[날짜문자열]', '[문자열날짜포맷]', '[변환할문자열날짜포맷]')
 *(ex)
 * g_formatYYMM('201609')
 * g_formatYYMM('201609', 'YYYYMM', 'YYYY-MM')
 */
function g_formatYYMM(str, fromFmt, toFmt) {
  fromFmt = fromFmt || "YYYYMM";
  //toFmt = toFmt || 'YYYY.MM';
  toFmt = toFmt || g_localeOptions.yymmFormat.toUpperCase();
  //log('g_formatYYMM : ', str, fromFmt, toFmt);

  if (g_toStr(str) == "") return str;

  var ret = moment(str, fromFmt).format(toFmt);

  return ret;
}

/*
 * 날짜(월일) 포맷팅
 * g_formatMMDD('[날짜문자열]', '[문자열날짜포맷]', '[변환할문자열날짜포맷]')
 *(ex)
 * g_formatYYMM('0910')
 * g_formatYYMM('0910', 'MMDD', 'MM.DD')
 */
function g_formatMMDD(str, fromFmt, toFmt) {
  fromFmt = fromFmt || "MMDD";
  //toFmt = toFmt || 'MM.DD';
  toFmt = toFmt || g_localeOptions.mmddFormat.toUpperCase();
  //log('g_formatMMDD: ', str, fromFmt, toFmt);

  var ret = moment(str, fromFmt).format(toFmt);

  return ret;
}

/*
 * 시간 포맷팅
 * g_formatTime('[시간문자열]', '[문자열시간포맷]', '[변환할문자열시간포맷]')
 *(ex)
 * g_formatTime('1910')
 * g_formatTime('1910', 'HHmm', 'HH:mm TT')
 */
function g_formatTime(str, fromFmt, toFmt) {
  fromFmt = fromFmt || "HHmm";
  //toFmt = toFmt || 'HH:mm';

  var timeformat = g_toMomentFormat(null, g_localeOptions.timeFormat_nm);
  toFmt = toFmt || timeformat;

  var ret = moment(str, fromFmt).format(toFmt);

  return ret;
}

/**
 * HHmm 형식의 데이터를 시간분 포맷팅
 */
function g_formatHourMin(hhmm, fmtType) {
  fmtType = fmtType || "1";
  //log('g_formatHourMin: ', hhmm);
  var ret = g_toStr(hhmm);

  if (ret.length >= 4) {
    var hour_length = ret.length - 2;

    //00h 00m
    if (fmtType == "2") {
      //ret = g_stringFormat('{0}{1} {2}{3}', g_left(ret, hour_length), CONST.LBL_TIME_HOUR, g_right(ret, 2), CONST.LBL_TIME_MIN);
      ret = g_stringFormat(
        "{0}{1} {2}{3}",
        g_left(ret, hour_length),
        "h",
        g_right(ret, 2),
        "m"
      );
      //log('ret: ', ret);
    }
    //HH:mm
    else {
      ret = g_stringFormat(
        "{0}:{1}",
        g_left(ret, hour_length),
        g_right(ret, 2)
      );
    }
  }

  return ret;
}

/**
 * 시간분(HHmm) 형식 validation
 */
function g_isHHmm(value) {
  var matcher = /^[0-2][0-9][0-5][0-9]$/;
  return matcher.test(value);
}

/**
 * Y/N 포맷팅
 */
function g_formatYN(value, defVal) {
  defVal = defVal || "";
  value = g_toStr(value);

  if (value == "1") {
    return "Y";
  } else {
    return value == "0" ? "N" : defVal;
  }
}

/**
 * 콤마 포맷팅
 */
function g_formatComma(val, isEmptyToZero) {
  isEmptyToZero = g_nvl(isEmptyToZero, false);

  val = g_toStr(val);
  if (val == "" && isEmptyToZero === true) {
    val = "0";
  }

  var rVal = Math.ceil(val);
  var regExp = /[#0]/gi;
  var numType = g_localeOptions.numberType;
  var seperators = gfn_removeSpacCharRegExr(numType, regExp).split("");
  var _numGrpSep = numType.substr(numType.indexOf(seperators[0]), 1); // locale 설정 정보에 따른 정수 그룹 구분자
  return gfn_addCommas(rVal, _numGrpSep, "^");
  //return addCommas(val);	//TODO 로케일 처리
}

/**
 * 월의 첫째 날짜 조회
 */
function g_getFirstDate(ymd, fmt) {
  ymd = g_fixDate($.trim(g_toStr(ymd)));

  if (ymd == "") {
    return ymd;
  }

  fmt = fmt || "YYYYMMDD";
  if (ymd.length == 6) {
    return ymd + "01";
  }

  return moment(ymd, fmt).startOf("month").format(fmt);
}

/**
 * 월의 마지막 날짜 조회
 */
function g_getLastDate(ymd, fmt) {
  ymd = g_fixDate($.trim(g_toStr(ymd)));

  if (ymd == "") {
    return ymd;
  }

  fmt = fmt || "YYYYMMDD";
  if (ymd.length == 6) {
    ymd = ymd + "01";
  }

  return moment(ymd, fmt).endOf("month").format(fmt);
}

/**
 * 날짜 가감
 */
function g_dateAdd(ymd, addNum, datePart) {
  ymd = g_fixDate($.trim(g_toStr(ymd)));
  datePart = datePart || "day"; //day, month, year 등
  var ret = ymd;

  if (g_isDateYmd(ymd)) {
    ret = moment(ymd, "YYYYMMDD")
      .add(g_toNum(addNum), datePart)
      .format("YYYYMMDD");
  }
  return ret;
}

/**
 * 지정한 단위로 숫자 절사
 */
function g_cutNum(num, cutNum) {
  cutNum = cutNum || 1;
  return Math.floor(num / cutNum) * cutNum;
}

/**
 * 지정한 단위에서 숫자 올림
 */
function g_ceil(num, ceilNum) {
  ceilNum = ceilNum || 1;
  return Math.ceil(num / ceilNum) * ceilNum;
}

/**
 * 지정한 단위에서 숫자 올림
 */
function g_getMessage(msgCode, bindInfo) {
  var msg = getCachedMsg(msgCode);
  if (msg == null) {
    var data = g_ajaxSync(
      CONST.CONTEXT_PATH + "/frameone/syscommon/searchMessage.fo",
      { msgCode: msgCode }
    );
    msg = data.msgText;
  }
  var boundMessage = replaceMessageBind(msg, bindInfo);
  return boundMessage.replace(/\\n/gi, "\n");
}

/**
 * 문자열 replaceAll
 */
String.prototype.replaceAll = function (target, replacement) {
  return this.split(target).join(replacement);
};

/**
 * html tag 제거
 */
String.prototype.stripTags = function () {
  var rex = /(<([^>]+)>)/gi;
  return this.replace(rex, "");
};

/**
 * 여러개의 체크박스 중 최소 n개를 체크했는지 검사
 */
$.fn.chkChecked = function (errBind, errCd, minCount) {
  minCount = minCount || 1;
  errCd = errCd || "MSG_COM_VAL_007"; //{0}을(를) 선택해 주십시오.

  var ret = true;

  if (this.filter(":checked").length < minCount) {
    showMessage(errCd, errBind);
    ret = false;
  }

  return ret;
};

/**
 * select/checkbox/radio onchage시 value에 따라 단위텍스트 변경되도록 이벤트 바인딩
 * @ex  #frmPayCostPoly 내의 모든 select에 바인딩
 * 	   $('#frmPayCostPoly select').bindChangeLabel();
 */
$.fn.bindChangeLabel = function () {
  this.on("change", function () {
    //log('bindChangeLabel', $(this).val());
    var $parent = $(this).parent();

    if ($parent.find("[data-for]").length > 0) {
      $parent.find("[data-for]").addClass("none");
      $parent.find('[data-for="' + $(this).val() + '"]').removeClass("none");
    }
  });
};

/**************************************************************************************/
/*********************************************************
 * FUNCTION NAME : getDatasetFromFOParams
 * FUNCTION DESC : FramOne parameters 에서 dataset을 가져온다.
 *
 * @param
 *			foParams  : FrameOne Parameters
 *			dsName    : dataset명
 * @return
 *			FrameOne dataset 구조의 json 데이터
 *********************************************************/
function gfn_getDatasetFromFOParams(foParams, dsName) {
  var retData = [];
  if (!dsName) {
    if (!gfn_isNull(foParams[dsName])) {
      retData = foParams[dsName].data;
    } else {
      if (
        !gfn_isNull(foParams["data"]) &&
        !gfn_isNull(foParams["data"][dsName])
      ) {
        retData = foParams["data"][dsName].data;
      }
    }
  }
  return retData;
}

function gfn_isNull(sValue) {
  if (sValue instanceof String) {
    var sVal = new String(sValue);
    if (
      sVal.valueOf() == "undefined" ||
      sValue == null ||
      sValue == "null" ||
      sValue.trim().length <= 0
    )
      return true;
  } else {
    if (
      typeof sValue == "undefined" ||
      sValue == "null" ||
      sValue == "undefined" ||
      sValue == null ||
      sValue == undefined ||
      sValue.length == 0
    )
      return true;
  }

  var v_ChkStr = new String(sValue);
  if (v_ChkStr == null || v_ChkStr.length == 0) return true;

  return false;
}

function gfn_nvl(strValue, strValue2) {
  if (this.gfn_isNull(strValue)) return strValue2;
  return strValue;
}

/*
 * toNumber
 * 입력된 값을 실수형 전환하는 Basic API 입니다
 * Parameter : val, bDate
 * 		Decimal > 실수 형식으로 전환
 *		Integer > 정수를 직접 실수로 전환
 * 		Object > 0000년 1월 1일 기준 날자수를 실수로 전환. 시각은 1일을 1로 환산해 계산된 값으로 변환됩니다.
 * 		String > 문자열을 Parsing 해 실수로 전환.
 *				bDate = true 일때 0000년 1월 1일 기준 날자수를 실수로 전환. 시각은 1일을 1로 환산해 계산된 값으로 변환됩니다.
 * Return : 실수형으로 변환된 값
 *
 */
function gfn_toNumber(val, bDate) {
  var type = typeof val;

  switch (type) {
    case "object": // 날짜
      var year = val.getFullYear();
      var month = val.getMonth();
      var day = val.getDate();
      var hours = val.getHours();
      var minutes = val.getMinutes();
      var seconds = val.getSeconds();
      var milliseconds = val.getMilliseconds();

      //trace(year + " " + month + " " + day + " " + hours + " " + minutes + " " + seconds + " " + milliseconds);

      // MP 기준은 0000년 01월 01 부터
      // Nexacro 기준은 1970년 01월 01 부터

      var nMPDate = 719528; // MP 기준 0000년 01월 01 까지 일 수

      // new Date(year, month, day, hours, minutes, seconds, milliseconds)
      var startDt = new Date(Number(1970), Number(01) - 1, Number(01));
      var endDt = new Date(
        year,
        month,
        day,
        hours,
        minutes,
        seconds,
        milliseconds
      );

      var resultDt =
        endDt.valueOf() / (24 * 60 * 60 * 1000) -
        startDt.valueOf() / (24 * 60 * 60 * 1000) +
        nMPDate;
      return resultDt;
      break;

    case "string": // 문자열
      if (bDate) {
        // date 형식의 string
        var yyyy = "";
        var mm = "";

        var dd = "";
        var hh = "";
        var min = "";
        var ss = "";

        if (val.length >= 8) {
          yyyy = val.substr(0, 4);
          mm = val.substr(4, 2);
          dd = val.substr(6, 2);

          if (val.length >= 10) {
            hh = val.substr(8, 2);
          } else {
            hh = "00";
          }

          if (val.length >= 12) {
            min = val.substr(10, 2);
          } else {
            min = "00";
          }

          if (val.length >= 14) {
            ss = val.substr(12, 2);
          } else {
            ss = "00";
          }

          var nMPDate = 719528; // MP 기준 0000년 01월 01 까지 일 수

          // new Date(year, month, day, hours, minutes, seconds, milliseconds)
          var startDt = new Date(Number(1970), Number(01) - 1, Number(01));
          var endDt = new Date(yyyy, nexacro.toNumber(mm) - 1, dd, hh, min, ss);

          var resultDt =
            endDt.valueOf() / (24 * 60 * 60 * 1000) -
            startDt.valueOf() / (24 * 60 * 60 * 1000) +
            nMPDate;
          return resultDt;
        }
      } else {
        return parseFloat(val);
      }
      break;
    default:
      // number
      return parseFloat(val);
      break;
  }
}

//********************************************************************
//입력된 값 또는 수식을 검사해 적당한 값을 Return 하는  Basic API
//********************************************************************
function gfn_decode() {
  var condVal = arguments[0] == undefined ? null : arguments[0];

  for (var i = 1; i < arguments.length; i += 2) {
    if (i + 1 == arguments.length) return arguments[i];

    if (condVal == arguments[i]) {
      return arguments[i + 1];
    }
  }
  return arguments[i - 2];
}

function gfn_subString(stringValue, nStart, nLength) {
  if (arguments.length == 3) return String(stringValue).substr(nStart, nLength);
  else return String(stringValue).substr(nStart);
}

function gfn_split(stringValue, strDelimiter) {
  return String(stringValue).split(strDelimiter);
}

/******************************************************************************
 * 함수명         : Length()
 * 설명           : 입력값 형태에 따라서 길이 또는 범위를 구하는 함수 ( bound 함수와 같음 )
 * argument       : 객체, 문자열, 배열
 * return         : Type에 따라 구해진 길이 또는 범위
 * Length("123")
 ******************************************************************************/
function gfn_length(args) {
  if (gfn_isNull(args)) return 0;

  if (args.components) {
    return args.components.length; //object인 경우 count of components
  } else {
    return gfn_nvl(args.length, 0); //Array, String, Variant인 경우
  }
}

//********************************************************************
// 문자열에 있는 모든 영어를 소문자로 바꾸는 Basic API
//********************************************************************
function gfn_toLower(args) {
  if (this.gfn_isNull(args)) return "";
  return String(args).toLowerCase();
}

/*********************************************************
 * FUNCTION NAME    : g_codeValue
 * FUNCTION DESC	: 코드 리스트 분류값(keyType)으로 코드 or 코드명 추출
 * @param
 * 		codeArr(코드리스트 Array), keyType( 'code' or 'value'), value(요청값)
 * 		ex) codeValue(<fo:codeList outType="auiGrid" clCd="PA04" />,'code', apprData[idx].APRV_STATUS_CD2)
 * @return
 *
 *********************************************************/
function g_codeValue(codeArr, keyType, value) {
  var retStr = "";

  if (!isEmpty(codeArr)) {
    for (var i = 0; i < codeArr.length; i++) {
      if ("code" == keyType) {
        if (codeArr[i]["code"] == value) {
          retStr = codeArr[i]["value"];
          break;
        }
      } else {
        if (codeArr[i]["value"] == value) {
          retStr = codeArr[i]["code"];
          break;
        }
      }
    }
  }
  return retStr;
}

/*********************************************************
 * FUNCTION NAME    : g_isEmpty
 * FUNCTION DESC	: "" / null check ( "" , null , undefined , [] , {} )
 * @param
 * @return
 *
 *********************************************************/
function g_isEmpty(value) {
  if (
    value == "" ||
    value == null ||
    value == undefined ||
    (value != null && typeof value == "object" && !Object.keys(value).length)
  ) {
    return true;
  } else {
    return false;
  }
}

function _dateFormatString(strFormat) {
  if (this.gfn_isNull(strFormat)) return "";

  var date = new Date();
  var fY = String(date.getFullYear());
  var fY2 = fY.substr(fY.length - 2, 2);

  strFormat = strFormat.toString();
  strFormat = strFormat.split("%Y").join(String(date.getFullYear()));
  strFormat = strFormat.split("%y").join(fY2);
  strFormat = strFormat
    .split("%m")
    .join(String(date.getMonth() + 1).lpad(2, "0"));
  strFormat = strFormat.split("%d").join(String(date.getDate()).lpad(2, "0"));
  strFormat = strFormat.split("%H").join(String(date.getHours()).lpad(2, "0"));
  strFormat = strFormat
    .split("%M")
    .join(String(date.getMinutes()).lpad(2, "0"));
  strFormat = strFormat
    .split("%S")
    .join(String(date.getSeconds()).lpad(2, "0"));

  return strFormat;
}

/********************************************************************
 * FUNCTION NAME    : gfn_today
 * FUNCTION DESC	: 해당 로컬 PC의 오늘 날짜를 가져온다.
 * @param
 * @return
 *
 ********************************************************************/
function gfn_today() {
  return _dateFormatString("%Y%m%d");
}

//********************************************************************
// 해당 로컬 PC의 날짜시각을 가져온다.
// yyyyMMddhhmmss의 14자리 문자열로 값을 2015-01-27
//********************************************************************
function gfn_getDate() {
  return _dateFormatString("%Y%m%d%H%M%S");
}

/******************************************************************
 * FUNCTION NAME :		gfn_getTime
 * FUNCTION DESC :		현재시간 조회.
 *
 * @return
 *				hhmmss 형태 string.
 ******************************************************************/
function gfn_getTime() {
  var date = gfn_getDate();
  var strTime = date.substr(date.length - 6, 6);
  return strTime;
}

//********************************************************************
// 특수문자 제거
//********************************************************************
function gfn_removeSpacCharRegExr(str, regExp) {
  if (str == undefined) return "";
  return str.replace(regExp, "");
}

function gfn_removeSpecChar(str) {
  var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
  //return str.replace(regExp, "");
  return gfn_removeSpacCharRegExr(str, regExp);
}

function gfn_isIncludeSpecChar(str) {
  var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
  return regExp.test(str);
}

/*********************************************************
 * FUNCTION NAME    : gfn_checkValidDate
 * FUNCTION DESC	: 날짜 유효 체크 및 날짜 입력시 년월을 제외한 일자 또는 월일만 입력할 경우 앞에 현재 년 또는 년월을 채워준다.
 * @param
 * 		strCalText 입력 날짜
 * 		isDefToday 유효하지 않은 날짜인 경우 default값으로 오늘 날짜를 반환할지 여부(default:true)
 * @return
 *		특수문자 없이 YYYYMMDD 포멧의 날짜 반환
 *********************************************************/
function gfn_checkValidDate(strCalText, isDefToday) {
  if (isEmpty(strCalText)) return;
  if (gfn_isNull(isDefToday)) isDefToday = true;
  strCalText = gfn_removeSpecChar(strCalText); // 입력일자
  var strCurrDate = gfn_today(); // 현재일자

  var strYymmdd = strCalText;
  if (strCalText.length < 8) {
    if (strCalText.length == 1 || strCalText.length == 3) {
      strYymmdd =
        strCurrDate.substring(0, 7 - strCalText.length) + "0" + strCalText;
    } else {
      strYymmdd = strCurrDate.substring(0, 8 - strCalText.length) + strCalText;
    }
  }

  if (isDateYmd(strYymmdd)) {
    return strYymmdd;
  } else {
    return isDefToday ? strCurrDate : "";
  }
}

/*********************************************************
 * FUNCTION NAME    : gfn_checkValidDay
 * FUNCTION DESC	: 날짜 유효 체크 및 날짜 입력시 일을 제외한 일자 또는 년월만 입력할 경우 뒤에 일을 채워준다.
 * @param
 * 		strCalText 입력 날짜
 * 		isDefToday 유효하지 않은 날짜인 경우 default값으로 오늘 날짜를 반환할지 여부(default:true)
 * @return
 *		특수문자 없이 YYYYMMDD 포멧의 날짜 반환
 *********************************************************/
function gfn_checkValidDay(strCalText, isDefToday) {
  if (isEmpty(strCalText)) return;
  if (gfn_isNull(isDefToday)) isDefToday = true;
  strCalText = gfn_removeSpecChar(strCalText); // 입력일자
  var strCurrDate = gfn_today(); // 현재일자

  var strYymmdd = strCalText;
  if (strCalText.length < 8) {
    strYymmdd = strCalText + "01"; //strCurrDate.substr(6, 2);
  }

  if (isDateYmd(strYymmdd)) {
    return strYymmdd;
  } else {
    return isDefToday ? strCurrDate : "";
  }
}
/*********************************************************
 * FUNCTION NAME    : gfn_checkValidYear
 * FUNCTION DESC	: 날짜 유효 체크 및 날짜 입력시 일자를 제외한 년월만 입력할 경우 뒤에 현재년도을 채워준다.
 * @param
 * 		strCalText 입력 날짜
 * 		isDefToday 유효하지 않은 날짜인 경우 default값으로 오늘 날짜를 반환할지 여부(default:true)
 * @return
 *		특수문자 없이 YYYYMMDD 포멧의 날짜 반환
 *********************************************************/
function gfn_checkValidYear(strCalText, isDefToday) {
  if (isEmpty(strCalText)) return;
  if (gfn_isNull(isDefToday)) isDefToday = true;
  strCalText = gfn_removeSpecChar(strCalText); // 입력일자
  var strCurrDate = gfn_today(); // 현재일자

  var strYymm = strCalText;
  if (strCalText.length < 8) {
    if (strCalText.length == 1 || strCalText.length == 3) {
      strYymm = strCurrDate.substr(0, 4) + "0" + strCalText;
    } else {
      strYymm = strCurrDate.substr(0, 4) + strCalText;
    }
  }

  if (isDateYmd(strYymm)) {
    return strYymm;
  } else {
    return isDefToday ? strCurrDate : "";
  }
}

/**
 * 주어진 시간 문자열(HHmmss)을 형식화한다.
 */
function gfn_formatTimeStr(strTime) {
  if (isEmpty(strTime)) return "";
  var retTime = strTime;
  if (strTime.indexOf(":") > -1) {
    var hhmmss = strTime.split(":");
    if (hhmmss.length < 3) {
      retTime = hhmmss[0].lpad(2, "0") + hhmmss[1].lpad(2, "0") + "00";
    } else {
      retTime =
        hhmmss[0].lpad(2, "0") +
        hhmmss[1].lpad(2, "0") +
        hhmmss[2].lpad(2, "0");
    }
  } else {
    retTime = gfn_removeSpecChar(strTime);
  }
  return retTime;
}

/**
 * 시간 유효성 체크
 */
function gfn_isTimeHhmmss(strTime) {
  if (!moment(strTime, "HHmmss").isValid()) {
    return false;
  }
  return true;
}

/*********************************************************
 * FUNCTION NAME    : gfn_checkValidTime
 * FUNCTION DESC	: 시간 유효 체크 및 시간 입력시 HHmm(24시간) 방식으로 시간 포멧을 변경하여 반환
 * @param
 * 		strTime 입력 시간
 * 		isDefTime 유효하지 않은 시간인 경우 default값으로 오늘 날짜를 반환할지 여부(default:true)
 * @return
 *		특수문자 없이 HHmmss 포멧의 날짜 반환
 *********************************************************/
function gfn_checkValidTime(strTime, isDefTime) {
  if (isEmpty(strTime)) return "";
  if (gfn_isNull(isDefTime)) isDefTime = true;
  var currTime = gfn_getTime(); // 현재일자

  var retTime = gfn_formatTimeStr(strTime);
  //log("gfn_checkValidTime time : ", strTime, retTime);

  if (gfn_isTimeHhmmss(retTime)) {
    return retTime;
  } else {
    return isDefTime ? currTime : "";
  }
}

/**
 * 로케일별 날짜 포멧의 날짜를 YYYYMMDD 포멧의 날짜로 변환하여 반환
 */
function gfn_getyymmddDate(strCalText, format) {
  if (isEmpty(strCalText)) return "";
  strCalText = gfn_removeSpecChar(strCalText); // 입력일자
  format = gfn_removeSpecChar(format).toUpperCase(); // 입력일자

  var yymmdd = new Date(moment(strCalText, format));
  var strDate =
    String(yymmdd.getFullYear()) +
    String(yymmdd.getMonth() + 1).lpad(2, "0") +
    String(yymmdd.getDate()).lpad(2, "0");

  return strDate;
}

function gfn_addCommas(nStr, groupSeparator, radixPoint) {
  if (g_toNum(nStr) == 0) return 0;

  nStr += "";
  if (gfn_isNull(groupSeparator)) groupSeparator = ",";
  if (gfn_isNull(radixPoint)) radixPoint = ".";
  x = nStr.split(radixPoint);
  x1 = x[0];
  x2 = x.length > 1 ? radixPoint + x[1] : "";
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1" + groupSeparator + "$2");
  }
  return x1 + x2;
}

function _getMomentTimeFormat(format) {
  var timeFormat = format.replace(/MM/g, "mm").replace(/SS/g, "ss");
  if (format.indexOf(" tt") > -1 || format.indexOf(" TT") > -1) {
    // 24 hour time
    timeFormat = timeFormat
      .replace(/HH/g, "hh")
      .replace(/tt/g, "a")
      .replace(/TT/g, "A");
  } else {
    // 12 hour time
    timeFormat = timeFormat.replace(/hh/g, "HH");
  }
  return timeFormat;
}

/**
 * Number.prototype.format(n, x, s, c)
 *
 * @param integer n: length of decimal
 * @param integer x: length of whole part
 * @param mixed   s: sections delimiter
 * @param mixed   c: decimal delimiter
 */
Number.prototype.format = function (n, x, s, c) {
  var re = "\\d(?=(\\d{" + (x || 3) + "})+" + (n > 0 ? "\\D" : "$") + ")",
    num = this.toFixed(Math.max(0, ~~n));

  return (c ? num.replace(".", c) : num).replace(
    new RegExp(re, "g"),
    "$&" + (s || ",")
  );
};
/******************************************** 공통 유틸리티 함수 End ****************************************************/
/*
 *	현재 년월 정보를 반환한다.
 * 	@return		현재 년월
 */
function gfn_todayYymm() {
  return _dateFormatString("%Y%m");
}
