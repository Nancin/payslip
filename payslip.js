var IT_TAPER = 100000,
	TODAY = new Date();
var VIEW = 'weekly'; // 'weekly' | 'monthly' | 'yearly'
var MULTIPLIERS = {
	weekly: 1,
	monthly: 52 / 12,
	yearly: 52
};

function fiscalYr(d) {
	var y = d.getFullYear(),
		m = d.getMonth(),
		s = m >= 3 ? y : y - 1;
	return s + '/' + (String(s + 1).slice(-2));
}

function d2s(d) {
	return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}

function s2d(s) {
	var p = s.split('-');
	return new Date(+p[0], +p[1] - 1, +p[2]);
}

function fmt(n) {
	return '£' + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
}

function fmtN(n) {
	return Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
}

function r2(n) {
	return Math.round(n * 100) / 100;
}

function parseNum(s) {
	return parseFloat(String(s).replace(/[\s\u2009\u202f,]/g, '')) || 0;
}

function fmtDisp(n) {
	var p = Math.abs(n).toFixed(2).split('.');
	p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
	return p.join('.');
}

function fmtInt(n) {
	return String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
}

function parseInt2(s) {
	return Math.round(parseNum(s));
}

function fmtH(h) {
	var hh = Math.floor(h),
		mm = Math.round((h - hh) * 60);
	return hh + 'h' + (mm > 0 ? '\u2009' + mm + 'm' : '');
}

function getHM(ph, pm) {
	return (parseInt(document.getElementById(ph).value) || 0) + (parseInt(document.getElementById(pm).value) || 0) / 60;
}

function v(id) {
	return parseFloat(document.getElementById(id).value) || 0;
}

function scale(weeklyVal) {
	return r2(weeklyVal * MULTIPLIERS[VIEW]);
}

function viewLabel() {
	if (VIEW === 'weekly') return 'weekly';
	if (VIEW === 'monthly') return 'monthly (÷12×52)';
	return 'yearly (×52)';
}

function viewShort() {
	if (VIEW === 'weekly') return 'weekly';
	if (VIEW === 'monthly') return 'monthly';
	return 'yearly';
}

function attachNum(id, def) {
	var el = document.getElementById(id);
	if (!el) return;
	el.value = def > 0 ? fmtDisp(def) : '';
	el.addEventListener('focus', function () {
		var v = parseNum(this.value);
		this.value = v > 0 ? v : '';
		this.select();
	});
	el.addEventListener('blur', function () {
		var v = parseNum(this.value);
		this.value = v > 0 ? fmtDisp(v) : '';
		liveCalc();
	});
	el.addEventListener('input', function () {
		liveCalc();
	});
}

function attachInt(id, def) {
	var el = document.getElementById(id);
	if (!el) return;
	el.value = def > 0 ? fmtInt(def) : '';
	el.addEventListener('focus', function () {
		var v = parseInt2(this.value);
		this.value = v > 0 ? v : '';
		this.select();
	});
	el.addEventListener('blur', function () {
		var v = parseInt2(this.value);
		this.value = v > 0 ? fmtInt(v) : '';
		liveCalc();
	});
	el.addEventListener('input', function () {
		liveCalc();
	});
}

function getInt(id) {
	return parseInt2(document.getElementById(id).value);
}

function updateDisps() {
	var rate = parseNum(document.getElementById('hourly_rate').value);
	[
		['base', 'base_h', 'base_m'],
		['ot', 'ot_h', 'ot_m'],
		['sat', 'sat_h', 'sat_m'],
		['sun', 'sun_h', 'sun_m']
	].forEach(function (p) {
		var el = document.getElementById(p[0] + '_disp');
		if (el) el.innerHTML = '<strong>' + fmtH(getHM(p[1], p[2])) + '</strong>';
	});
	var e1 = document.getElementById('ot_rate_disp');
	if (e1) e1.innerHTML = '<strong>£' + fmtN(rate * v('ot_mult')) + '/h</strong>';
	var e2 = document.getElementById('wk_rate_disp');
	if (e2) e2.innerHTML = '<strong>£' + fmtN(rate * v('wk_mult')) + '/h</strong>';
}

function getWeekNumber(d) {
	var u = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	var day = u.getUTCDay() || 7;
	u.setUTCDate(u.getUTCDate() + 4 - day);
	var ys = new Date(Date.UTC(u.getUTCFullYear(), 0, 1));
	return Math.ceil(((u - ys) / 86400000 + 1) / 7);
}

function getNextFriday(d) {
	var diff = (5 - d.getDay() + 7) % 7 || 7,
		fri = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
	return ('0' + fri.getDate()).slice(-2) + '/' + ('0' + (fri.getMonth() + 1)).slice(-2) + '/' + fri.getFullYear();
}

function updateWeekInfo() {
	var wn = getWeekNumber(TODAY);
	document.getElementById('s-pill').textContent = 'Week ' + wn;
	document.getElementById('s-period').textContent = 'Week ' + wn + ' · pay ' + getNextFriday(TODAY);
	document.getElementById('hero-week-num').textContent = wn;
	document.getElementById('hero-pay-date').textContent = '' + getNextFriday(TODAY);
	document.getElementById('hero-pill-week').textContent = 'Week ' + wn + ' · ' + fiscalYr(TODAY);
}

/* Dark/light */
var isDark = true;
(function () {
	var t;
	try {
		t = localStorage.getItem('pslip-theme');
	} catch (e) {}
	if (t === 'light') {
		isDark = false;
		applyTheme();
	}
})();

function applyTheme() {
	if (isDark) {
		document.documentElement.style.setProperty('--bg', '#080B10');
		document.documentElement.style.setProperty('--bg2', '#0C1018');
		document.documentElement.style.setProperty('--surface', '#0F1520');
		document.documentElement.style.setProperty('--surface2', '#141C2A');
		document.documentElement.style.setProperty('--surface3', '#1A2335');
		document.documentElement.style.setProperty('--border', '#1E2C42');
		document.documentElement.style.setProperty('--border2', '#253548');
		document.documentElement.style.setProperty('--text', '#E8EEF8');
		document.documentElement.style.setProperty('--text2', '#8A99B3');
		document.documentElement.style.setProperty('--text3', '#445566');
		document.documentElement.style.setProperty('--tog-on-bg', '#253548');
		document.documentElement.style.setProperty('--tog-on-text', '#C8D8F0');
		document.getElementById('theme-icon').textContent = '☀️';
		document.body.style.backgroundImage = 'radial-gradient(ellipse 80% 40% at 50% -10%,rgba(26,111,255,.12),transparent)';
		document.querySelector('.topnav').style.background = 'rgba(8,11,16,.9)';
	} else {
		document.documentElement.style.setProperty('--bg', '#F2F5FA');
		document.documentElement.style.setProperty('--bg2', '#E8EDF5');
		document.documentElement.style.setProperty('--surface', '#FFFFFF');
		document.documentElement.style.setProperty('--surface2', '#F5F7FC');
		document.documentElement.style.setProperty('--surface3', '#EDF0F8');
		document.documentElement.style.setProperty('--border', '#DDE3F0');
		document.documentElement.style.setProperty('--border2', '#C8D2E8');
		document.documentElement.style.setProperty('--text', '#0D1626');
		document.documentElement.style.setProperty('--text2', '#4A5A7A');
		document.documentElement.style.setProperty('--text3', '#8A99B3');
		document.documentElement.style.setProperty('--tog-on-bg', '#C8D2E8');
		document.documentElement.style.setProperty('--tog-on-text', '#1A2F55');
		document.getElementById('theme-icon').textContent = '🌙';
		document.body.style.backgroundImage = 'radial-gradient(ellipse 80% 40% at 50% -10%,rgba(26,111,255,.05),transparent)';
		document.querySelector('.topnav').style.background = 'rgba(242,245,250,.92)';
	}
}
document.getElementById('togBtn').addEventListener('click', function () {
	isDark = !isDark;
	var btn = this;
	var icon = document.getElementById('theme-icon');
	btn.classList.add('spinning');
	icon.addEventListener('animationend', function handler() {
		btn.classList.remove('spinning');
		icon.removeEventListener('animationend', handler);
	});
	icon.textContent = isDark ? '☀️' : '🌙';
	applyTheme();
	try {
		localStorage.setItem('pslip-theme', isDark ? 'dark' : 'light');
	} catch (e) {}
});

/* Period toggle — sliding thumb */
function movePillThumb(activeBtn) {
	var pill = document.getElementById('period-pill');
	var thumb = document.getElementById('pill-thumb');
	if (!pill || !thumb) return;
	var pillRect = pill.getBoundingClientRect();
	var btnRect = activeBtn.getBoundingClientRect();
	thumb.style.left = (btnRect.left - pillRect.left) + 'px';
	thumb.style.width = btnRect.width + 'px';
}

function setPeriodView(v, activeBtn) {
	VIEW = v;
	['weekly', 'monthly', 'yearly'].forEach(function (k) {
		document.getElementById('btn-' + k).className = 'tog-pill-btn' + (v === k ? ' on' : '');
	});
	movePillThumb(activeBtn);
	liveCalc();
}
document.getElementById('btn-weekly').addEventListener('click', function () {
	setPeriodView('weekly', this);
});
document.getElementById('btn-monthly').addEventListener('click', function () {
	setPeriodView('monthly', this);
});
document.getElementById('btn-yearly').addEventListener('click', function () {
	setPeriodView('yearly', this);
});

var di = document.getElementById('today-date');
di.value = d2s(TODAY);
di.addEventListener('change', function () {
	if (this.value) {
		TODAY = s2d(this.value);
		updateWeekInfo();
		liveCalc();
	}
});

/* ─── CHART ─── */
var _lastCalc = null;

function renderChart(c) {
	if (!c) return;
	var wrap = document.getElementById('chart-body');
	if (!wrap) return;
	var W = wrap.clientWidth || 600,
		H = 200;
	var maxV = Math.max(c.grossFull, c.totalDed, c.net, 1);
	var padT = 20,
		padB = 30,
		cH = H - padT - padB;

	var gridH = '';
	for (var gi = 0; gi <= 4; gi++) {
		var gv = maxV * (4 - gi) / 4;
		var gy = padT + ((maxV - gv) / maxV) * cH;
		gridH += '<div class="chart-yline" style="top:' + gy + 'px"></div>';
		gridH += '<div class="chart-ynum" style="top:' + (gy - 9) + 'px">£' + fmtInt(gv) + '</div>';
	}

	var CATS = [{
			lbl: 'Base Pay',
			g: c.baseAmt,
			r: 0
		},
		{
			lbl: 'Overtime',
			g: c.otAmt,
			r: 0
		},
		{
			lbl: 'Sat/Sun',
			g: c.satAmt + c.sunAmt,
			r: 0
		},
		{
			lbl: 'Gross',
			g: c.grossFull,
			r: 0
		},
		{
			lbl: 'Tax+NI',
			g: 0,
			r: c.itTotal + c.niTotal
		},
		{
			lbl: 'Pension',
			g: 0,
			r: c.penAmt
		},
		{
			lbl: 'Net Pay',
			g: c.net,
			r: 0
		}
	].filter(function (x) {
		return x.g > 0.01 || x.r > 0.01;
	});

	var barsH = '';
	CATS.forEach(function (cat, i) {
		var gH = cat.g > 0 ? Math.max(2, (cat.g / maxV) * cH) : 0;
		var rH = cat.r > 0 ? Math.max(2, (cat.r / maxV) * cH) : 0;
		var delay = (i * 0.07).toFixed(2);
		barsH += '<div class="bar-group" data-i="' + i + '">';
		barsH += '<div class="bar-pair" style="height:' + (Math.max(gH, rH) + 4) + 'px">';
		if (cat.g > 0.01) barsH += '<div class="bar bar-g" style="height:' + gH + 'px;animation-delay:' + delay + 's" data-g="' + cat.g + '" data-r="' + cat.r + '" data-n="' + cat.lbl + '"></div>';
		if (cat.r > 0.01) barsH += '<div class="bar bar-r" style="height:' + rH + 'px;animation-delay:' + delay + 's" data-g="' + cat.g + '" data-r="' + cat.r + '" data-n="' + cat.lbl + '"></div>';
		barsH += '</div>';
		barsH += '<div class="bar-lbl">' + cat.lbl + '</div>';
		barsH += '</div>';
	});

	wrap.innerHTML = gridH + '<div class="bars-wrap" style="height:' + H + 'px;padding-top:' + padT + 'px;padding-bottom:' + padB + 'px;align-items:flex-end">' + barsH + '</div>';

	var tt = document.getElementById('bar-tt');
	wrap.querySelectorAll('.bar').forEach(function (bar) {
		bar.addEventListener('mouseenter', function (e) {
			var g = parseFloat(this.dataset.g) || 0,
				r = parseFloat(this.dataset.r) || 0,
				net = g > 0 ? g : 0;
			document.getElementById('tt-label').textContent = this.dataset.n;
			document.getElementById('tt-gross').textContent = g > 0 ? fmt(g) : '—';
			document.getElementById('tt-ded').textContent = r > 0 ? fmt(r) : '—';
			document.getElementById('tt-net').textContent = net > 0 ? fmt(net) : '—';
			tt.className = 'show';
		});
		bar.addEventListener('mousemove', function (e) {
			tt.style.left = (e.clientX + 14) + 'px';
			tt.style.top = (e.clientY - 90) + 'px';
		});
		bar.addEventListener('mouseleave', function () {
			tt.className = '';
		});
	});
}

function calcWeek() {
	var rate = parseNum(document.getElementById('hourly_rate').value);
	var baseH = getHM('base_h', 'base_m'),
		otH = getHM('ot_h', 'ot_m'),
		otM = v('ot_mult');
	var satH = getHM('sat_h', 'sat_m'),
		sunH = getHM('sun_h', 'sun_m'),
		wkM = v('wk_mult');
	var bonus = parseNum(document.getElementById('bonus').value);
	var penPct = v('pen_pct') / 100,
		otherDed = parseNum(document.getElementById('other_ded').value);

	var IT_PA = getInt('it_pa') || 12570,
		IT_BT = getInt('it_basic_top') || 50270,
		IT_HT = getInt('it_higher_top') || 125140;
	var IT_BR = (v('it_basic_rate') || 20) / 100,
		IT_HR = (v('it_higher_rate') || 40) / 100,
		IT_AR = (v('it_add_rate') || 45) / 100;
	var NI_PT = getInt('ni_pt_annual') || 12570,
		NI_UEL = getInt('ni_uel_annual') || 50270;
	var NI_MR = (v('ni_main_rate') || 8) / 100,
		NI_UR = (v('ni_upper_rate') || 2) / 100;
	var taxAdj = parseNum(document.getElementById('tax_code_adj').value);
	var NI_PT_W = NI_PT / 52,
		NI_UEL_W = NI_UEL / 52;

	var baseAmt = r2(baseH * rate),
		otAmt = r2(otH * rate * otM),
		satAmt = r2(satH * rate * wkM),
		sunAmt = r2(sunH * rate * wkM);
	var grossFull = r2(baseAmt + otAmt + satAmt + sunAmt + bonus);
	var penAmt = r2((baseAmt + bonus) * penPct),
		grossTaxable = r2(grossFull - penAmt);

	var annualGross = grossTaxable * 52;
	var effPA = IT_PA + (taxAdj || 0);
	if (annualGross > IT_TAPER) effPA = Math.max(0, effPA - Math.floor((annualGross - IT_TAPER) / 2));
	var effPAW = effPA / 52,
		basicTopW = IT_BT / 52,
		higherTopW = IT_HT / 52;
	var abovePA = Math.max(0, grossTaxable - effPAW);
	var basicBandW = Math.max(0, basicTopW - effPAW),
		higherBandW = Math.max(0, higherTopW - basicTopW);
	var inBasic = Math.min(abovePA, basicBandW);
	var inHigher = abovePA > basicBandW ? Math.min(abovePA - basicBandW, higherBandW) : 0;
	var inAdd = abovePA > basicBandW + higherBandW ? abovePA - basicBandW - higherBandW : 0;
	var itBasic = r2(inBasic * IT_BR),
		itHigher = r2(inHigher * IT_HR),
		itAdd = r2(inAdd * IT_AR);
	var itTotal = r2(itBasic + itHigher + itAdd);
	var itBandLabel = inAdd > 0 ? 'Additional Rate' : inHigher > 0 ? 'Higher Rate' : inBasic > 0 ? 'Basic Rate' : 'Personal Allowance';
	var itBandClass = inAdd > 0 ? 'tg-add' : inHigher > 0 ? 'tg-higher' : inBasic > 0 ? 'tg-basic' : 'tg-free';

	var niInMain = Math.max(0, Math.min(grossTaxable, NI_UEL_W) - NI_PT_W);
	var niInUpper = Math.max(0, grossTaxable - NI_UEL_W);
	var niMain = r2(niInMain * NI_MR),
		niUpper = r2(niInUpper * NI_UR),
		niTotal = r2(niMain + niUpper);
	var niBandLabel = grossTaxable > NI_UEL_W ? 'Class 1 — Upper' : grossTaxable > NI_PT_W ? 'Class 1 — Lower' : 'Below PT';
	var niBandClass = grossTaxable > NI_UEL_W ? 'tg-ni-upper' : grossTaxable > NI_PT_W ? 'tg-ni-main' : 'tg-ni-free';

	var totalDed = r2(itTotal + niTotal + penAmt + otherDed),
		net = r2(grossFull - itTotal - niTotal - penAmt - otherDed);
	return {
		rate,
		baseH,
		otH,
		otM,
		satH,
		sunH,
		wkM,
		bonus,
		baseAmt,
		otAmt,
		satAmt,
		sunAmt,
		grossFull,
		penAmt,
		grossTaxable,
		effPAW,
		IT_BR,
		IT_HR,
		IT_AR,
		NI_PT_W,
		NI_UEL_W,
		NI_MR,
		NI_UR,
		inBasic,
		inHigher,
		inAdd,
		itBasic,
		itHigher,
		itAdd,
		itTotal,
		itBandLabel,
		itBandClass,
		niInMain,
		niInUpper,
		niMain,
		niUpper,
		niTotal,
		niBandLabel,
		niBandClass,
		otherDed,
		totalDed,
		net,
		totalH: baseH + otH + satH + sunH
	};
}

function flashEl(id) {
	var el = document.getElementById(id);
	if (!el) return;
	el.classList.remove('flash');
	void el.offsetWidth;
	el.classList.add('flash');
}

function renderSlip(c) {
	_lastCalc = c;
	var m = MULTIPLIERS[VIEW];

	/* Scaled values */
	var sGross = scale(c.grossFull);
	var sNet = scale(c.net);
	var sDed = scale(c.totalDed);
	var sIT = scale(c.itTotal);
	var sNI = scale(c.niTotal);

	/* Hero big number — always shows current view */
	var netStr = sNet.toFixed(2),
		parts = netStr.split('.');
	document.getElementById('hero-net-int').textContent = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
	document.getElementById('hero-net-dec').textContent = parts[1];

	var pct = c.grossFull > 0 ? Math.min(100, Math.round(c.net / c.grossFull * 100)) : 0;
	document.getElementById('hero-pill-rate').textContent = pct + '% take-home';
	document.getElementById('hero-pill-ded').textContent = fmt(sDed) + ' deductions';

	/* Eyebrow label */
	var eyeLabels = {
		weekly: 'WEEKLY PAY STATEMENT',
		monthly: 'MONTHLY PAY STATEMENT',
		yearly: 'ANNUAL PAY STATEMENT'
	};
	document.getElementById('hero-eyebrow-label').textContent = eyeLabels[VIEW];

	/* Hero stats row */
	document.getElementById('hs-gross').textContent = fmt(sGross);
	document.getElementById('hs-it').textContent = fmt(sIT);
	document.getElementById('hs-ni').textContent = fmt(sNI);

	/* 4th stat: show different context depending on view */
	var annualLabel = {
		weekly: 'Weekly Estimate',
		monthly: 'Monthly Estimate',
		yearly: 'Yearly Estimate'
	};
	var annualVal = {
		weekly: fmt(r2(c.net)),
		monthly: fmt(r2(c.net * 52 / 12)),
		yearly: fmt(c.net * 52)
	};
	document.getElementById('hs-annual-label').textContent = annualLabel[VIEW];
	document.getElementById('hs-annual').textContent = annualVal[VIEW];

	/* Slip header */
	document.getElementById('s-gross').textContent = fmt(sGross);
	document.getElementById('s-gross-lbl').textContent = 'gross ' + viewShort();
	document.getElementById('s-bar').style.width = pct + '%';
	document.getElementById('s-bar-pct').textContent = 'Take-home ' + pct + '%';
	document.getElementById('tax-ni-pct').textContent = 'Tax & NI ' + (c.grossFull > 0 ? Math.round((c.itTotal + c.niTotal) / c.grossFull * 100) : 0) + '%';


	/* Earnings table — always show weekly rates, scale the amounts */
	var e = '';
	if (c.baseH > 0) e += '<tr><td>Base Pay<span class="tag tg-base">Mon–Fri</span></td><td>' + fmtH(c.baseH) + ' × £' + fmtN(c.rate) + '</td><td>' + fmt(scale(c.baseAmt)) + '</td></tr>';
	if (c.otH > 0) e += '<tr><td>Overtime<span class="tag tg-ot">×' + c.otM + '</span></td><td>' + fmtH(c.otH) + ' × £' + fmtN(c.rate * c.otM) + '</td><td>' + fmt(scale(c.otAmt)) + '</td></tr>';
	if (c.satH > 0) e += '<tr><td>Saturday<span class="tag tg-sat">×' + c.wkM + '</span></td><td>' + fmtH(c.satH) + ' × £' + fmtN(c.rate * c.wkM) + '</td><td>' + fmt(scale(c.satAmt)) + '</td></tr>';
	if (c.sunH > 0) e += '<tr><td>Sunday<span class="tag tg-sun">×' + c.wkM + '</span></td><td>' + fmtH(c.sunH) + ' × £' + fmtN(c.rate * c.wkM) + '</td><td>' + fmt(scale(c.sunAmt)) + '</td></tr>';
	if (c.bonus > 0) e += '<tr><td>Bonus<span class="tag tg-bonus">extra</span></td><td>—</td><td>' + fmt(scale(c.bonus)) + '</td></tr>';
	if (c.penAmt > 0) e += '<tr><td>Pension (salary sacrifice)<span class="tag tg-pen">pre-tax</span></td><td>—</td><td style="color:var(--r)">−' + fmt(scale(c.penAmt)) + '</td></tr>';
	e += '<tr class="tr-total"><td>Taxable Gross</td><td></td><td>' + fmt(scale(c.grossTaxable)) + '</td></tr>';
	document.getElementById('s-earn').innerHTML = e;

	/* Deductions table */
	var d = '';
	d += '<tr class="det-head"><td colspan="2">Income Tax<span class="tag ' + c.itBandClass + '">' + c.itBandLabel + '</span></td></tr>';
	d += '<tr class="band-row"><td><span class="bnd" style="background:var(--g)"></span>Personal Allow. £' + fmtN(c.effPAW) + '/wk</td><td style="color:var(--g)">£0.00</td></tr>';
	if (c.inBasic > 0) d += '<tr class="band-row"><td><span class="bnd" style="background:#5B9FFF"></span>Basic ' + Math.round(c.IT_BR * 100) + '% — £' + fmtN(c.inBasic) + '/wk</td><td style="color:var(--r)">−£' + fmtN(scale(c.itBasic)) + '</td></tr>';
	if (c.inHigher > 0) d += '<tr class="band-row"><td><span class="bnd" style="background:var(--gold)"></span>Higher ' + Math.round(c.IT_HR * 100) + '% — £' + fmtN(c.inHigher) + '/wk</td><td style="color:var(--r)">−£' + fmtN(scale(c.itHigher)) + '</td></tr>';
	if (c.inAdd > 0) d += '<tr class="band-row"><td><span class="bnd" style="background:var(--r)"></span>Add. ' + Math.round(c.IT_AR * 100) + '% — £' + fmtN(c.inAdd) + '/wk</td><td style="color:var(--r)">−£' + fmtN(scale(c.itAdd)) + '</td></tr>';
	d += '<tr><td style="font-weight:700;padding-top:7px">Total Income Tax</td><td style="text-align:right;font-family:var(--mono);font-weight:700;color:var(--r);padding-top:7px">−' + fmt(scale(c.itTotal)) + '</td></tr>';
	d += '<tr class="det-head"><td colspan="2">National Insurance<span class="tag ' + c.niBandClass + '">' + c.niBandLabel + '</span></td></tr>';
	d += '<tr class="band-row"><td><span class="bnd" style="background:var(--g)"></span>Below PT £' + fmtN(c.NI_PT_W) + '/wk</td><td style="color:var(--g)">£0.00</td></tr>';
	if (c.niInMain > 0) d += '<tr class="band-row"><td><span class="bnd" style="background:#C050FF"></span>Lower ' + Math.round(c.NI_MR * 100) + '% — £' + fmtN(c.niInMain) + '/wk</td><td style="color:var(--r)">−£' + fmtN(scale(c.niMain)) + '</td></tr>';
	if (c.niInUpper > 0) d += '<tr class="band-row"><td><span class="bnd" style="background:var(--r)"></span>Upper ' + Math.round(c.NI_UR * 100) + '% — £' + fmtN(c.niInUpper) + '/wk</td><td style="color:var(--r)">−£' + fmtN(scale(c.niUpper)) + '</td></tr>';
	d += '<tr><td style="font-weight:700;padding-top:7px">Total NI</td><td style="text-align:right;font-family:var(--mono);font-weight:700;color:var(--r);padding-top:7px">−' + fmt(scale(c.niTotal)) + '</td></tr>';
	if (c.otherDed > 0) {
		d += '<tr><td>Other Deductions</td><td style="text-align:right;font-family:var(--mono);color:var(--r)">−' + fmt(scale(c.otherDed)) + '</td></tr>';
	}
	d += '<tr class="tr-total"><td>Total Deductions</td><td style="text-align:right;color:var(--r)">−' + fmt(sDed) + '</td></tr>';
	document.getElementById('s-ded').innerHTML = d;

	/* Net box */
	var netBoxLabels = {
		weekly: 'Net Weekly Take-Home',
		monthly: 'Net Monthly Take-Home',
		yearly: 'Net Annual Take-Home'
	};
	document.getElementById('net-box-lbl').textContent = netBoxLabels[VIEW];
	document.getElementById('s-net-box').textContent = fmt(sNet);
	var eff = c.grossFull > 0 ? (c.totalDed / c.grossFull * 100) : 0;

	document.getElementById('s-net-sub').textContent = subLabels[VIEW];

	['s-gross', 's-net-top', 's-net-box', 'hs-gross', 'hs-it', 'hs-ni', 'hs-annual'].forEach(flashEl);
	renderChart(c);
}

var TIPS = ['💡 At £14.54/hr for 37.5h, your annual gross is ~£28,353.', '⚡ Pension salary sacrifice reduces BOTH your tax and NI contributions.', '📈 You need 35 qualifying NI years for the full UK State Pension.', '🔑 Your personal allowance is £241.73/week in 2026/27.', '💰 Marriage Allowance lets you transfer £1,260 of unused personal allowance.', '📊 Higher rate tax starts at £50,270 — that\'s ~£967/week gross.', '🏠 Working from home? Claim £6/week tax relief from HMRC.', '🎯 A LISA before age 50 earns a 25% government bonus, up to £1,000/year.', '🔍 Overtime is taxed the same as regular pay — no special rate.', '📅 The UK tax year runs 6 April to 5 April.'];

function getDailyTip() {
	var t = new Date(),
		s = t.getFullYear() * 10000 + (t.getMonth() + 1) * 100 + t.getDate();
	return TIPS[s % TIPS.length];
}

function liveCalc() {
	updateDisps();
	renderSlip(calcWeek());
}

var resizeT;
window.addEventListener('resize', function () {
	clearTimeout(resizeT);
	resizeT = setTimeout(function () {
		if (_lastCalc) renderChart(_lastCalc);
	}, 150);
});

document.addEventListener('DOMContentLoaded', function () {
	updateWeekInfo();
	applyTheme();
	/* Init sliding thumb position */
	var initialBtn = document.getElementById('btn-weekly');
	var thumb = document.getElementById('pill-thumb');
	if (initialBtn && thumb) {
		/* Use rAF so layout is fully painted */
		requestAnimationFrame(function () {
			var pill = document.getElementById('period-pill');
			var pillRect = pill.getBoundingClientRect();
			var btnRect = initialBtn.getBoundingClientRect();
			thumb.style.transition = 'none';
			thumb.style.left = (btnRect.left - pillRect.left) + 'px';
			thumb.style.width = btnRect.width + 'px';
			requestAnimationFrame(function () {
				thumb.style.transition = '';
			});
		});
	}
	attachNum('hourly_rate', 14.54);
	attachNum('bonus', 10);
	attachNum('other_ded', 0);
	attachInt('it_pa', 12570);
	attachInt('it_basic_top', 50270);
	attachInt('it_higher_top', 125140);
	attachInt('ni_pt_annual', 12570);
	attachInt('ni_uel_annual', 50270);
	attachInt('tax_code_adj', 0);
	document.querySelectorAll('input[type=number]').forEach(function (inp) {
		inp.addEventListener('focus', function () {
			this.select();
		});
		inp.addEventListener('input', function () {
			liveCalc();
		});
	});
	document.getElementById('s-foot').textContent = getDailyTip();
	liveCalc();
});
