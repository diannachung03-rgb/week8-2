/**
 * 사계절 날씨 (Seasonal Weather) - Main Application Logic
 * Open-Meteo API 연동, 사계절 전환 엔진, 지오로케이션, 도시 검색, UI 바인딩
 */

// ==========================================================================
// 1. 상태 관리 (State Management)
// ==========================================================================
const state = {
  currentLocation: {
    name: '서울, 대한민국',
    lat: 37.5665,
    lon: 126.9780
  },
  weatherData: null,
  activeSeason: 'auto', // 'spring' | 'summer' | 'autumn' | 'winter' | 'auto'
  effectiveSeason: 'autumn'
};

// ==========================================================================
// 2. 날씨 코드(WMO) 매핑 및 고화질 SVG 아이콘
// ==========================================================================
const WEATHER_CODES = {
  0: { label: '맑음', icon: 'clear-day' },
  1: { label: '대체로 맑음', icon: 'partly-cloudy' },
  2: { label: '구름 조금', icon: 'partly-cloudy' },
  3: { label: '흐림', icon: 'cloudy' },
  45: { label: '안개', icon: 'fog' },
  48: { label: '상에 안개', icon: 'fog' },
  51: { label: '약한 이슬비', icon: 'drizzle' },
  53: { label: '이슬비', icon: 'drizzle' },
  55: { label: '강한 이슬비', icon: 'drizzle' },
  61: { label: '약한 비', icon: 'rain' },
  63: { label: '비', icon: 'rain' },
  65: { label: '강한 비', icon: 'heavy-rain' },
  71: { label: '약한 눈', icon: 'snow' },
  73: { label: '눈', icon: 'snow' },
  75: { label: '폭설', icon: 'heavy-snow' },
  77: { label: '싸락눈', icon: 'snow' },
  80: { label: '약한 소나기', icon: 'rain' },
  81: { label: '소나기', icon: 'heavy-rain' },
  82: { label: '거센 소나기', icon: 'heavy-rain' },
  85: { label: '약한 눈 소나기', icon: 'snow' },
  86: { label: '눈 소나기', icon: 'heavy-snow' },
  95: { label: '뇌우', icon: 'thunderstorm' },
  96: { label: '우박을 동반한 뇌우', icon: 'thunderstorm' },
  99: { label: '강한 우박 뇌우', icon: 'thunderstorm' }
};

function getWeatherMeta(code, isDay = 1) {
  const meta = WEATHER_CODES[code] || { label: '맑음', icon: 'clear-day' };
  let iconName = meta.icon;
  if (iconName === 'clear-day' && isDay === 0) iconName = 'clear-night';
  return { label: meta.label, iconName };
}

function getWeatherSvg(iconName) {
  switch (iconName) {
    case 'clear-day':
      return `<svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="14" fill="#fbbf24" stroke="#f59e0b" stroke-width="2.5"/>
        <g stroke="#f59e0b" stroke-width="3" stroke-linecap="round">
          <line x1="32" y1="6" x2="32" y2="12"/>
          <line x1="32" y1="52" x2="32" y2="58"/>
          <line x1="6" y1="32" x2="12" y2="32"/>
          <line x1="52" y1="32" x2="58" y2="32"/>
          <line x1="13.6" y1="13.6" x2="17.8" y2="17.8"/>
          <line x1="46.2" y1="46.2" x2="50.4" y2="50.4"/>
          <line x1="13.6" y1="50.4" x2="17.8" y2="46.2"/>
          <line x1="46.2" y1="17.8" x2="50.4" y2="13.6"/>
        </g>
      </svg>`;

    case 'clear-night':
      return `<svg viewBox="0 0 64 64" fill="none">
        <path d="M42 36A18 18 0 1 1 28 14a14 14 0 0 0 14 22z" fill="#facc15" stroke="#eab308" stroke-width="2.5"/>
        <circle cx="48" cy="18" r="1.5" fill="#fef08a"/>
        <circle cx="52" cy="30" r="1.2" fill="#fef08a"/>
      </svg>`;

    case 'partly-cloudy':
      return `<svg viewBox="0 0 64 64" fill="none">
        <circle cx="26" cy="24" r="10" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
        <path d="M22 48h24a10 10 0 0 0 1.2-19.9 14 14 0 0 0-26.4-3.1A11 11 0 0 0 22 48z" fill="#ffffff" fill-opacity="0.9" stroke="#cbd5e1" stroke-width="2.5" stroke-linejoin="round"/>
      </svg>`;

    case 'cloudy':
      return `<svg viewBox="0 0 64 64" fill="none">
        <path d="M22 46h24a10 10 0 0 0 1.2-19.9 14 14 0 0 0-26.4-3.1A11 11 0 0 0 22 46z" fill="#ffffff" fill-opacity="0.85" stroke="#94a3b8" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M16 40h20a8 8 0 0 0 1-15.9 11 11 0 0 0-20.8-2.5A8.8 8.8 0 0 0 16 40z" fill="#e2e8f0" fill-opacity="0.6" stroke="#94a3b8" stroke-width="2"/>
      </svg>`;

    case 'rain':
    case 'drizzle':
      return `<svg viewBox="0 0 64 64" fill="none">
        <path d="M20 38h24a10 10 0 0 0 1.2-19.9 14 14 0 0 0-26.4-3.1A11 11 0 0 0 20 38z" fill="#ffffff" fill-opacity="0.9" stroke="#cbd5e1" stroke-width="2.5"/>
        <g stroke="#38bdf8" stroke-width="2.8" stroke-linecap="round">
          <line x1="22" y1="44" x2="19" y2="52"/>
          <line x1="32" y1="44" x2="29" y2="52"/>
          <line x1="42" y1="44" x2="39" y2="52"/>
        </g>
      </svg>`;

    case 'heavy-rain':
      return `<svg viewBox="0 0 64 64" fill="none">
        <path d="M20 36h24a10 10 0 0 0 1.2-19.9 14 14 0 0 0-26.4-3.1A11 11 0 0 0 20 36z" fill="#cbd5e1" fill-opacity="0.95" stroke="#64748b" stroke-width="2.5"/>
        <g stroke="#0284c7" stroke-width="3" stroke-linecap="round">
          <line x1="20" y1="42" x2="16" y2="54"/>
          <line x1="30" y1="42" x2="26" y2="54"/>
          <line x1="40" y1="42" x2="36" y2="54"/>
        </g>
      </svg>`;

    case 'snow':
    case 'heavy-snow':
      return `<svg viewBox="0 0 64 64" fill="none">
        <path d="M20 38h24a10 10 0 0 0 1.2-19.9 14 14 0 0 0-26.4-3.1A11 11 0 0 0 20 38z" fill="#ffffff" fill-opacity="0.9" stroke="#cbd5e1" stroke-width="2.5"/>
        <g fill="#93c5fd">
          <circle cx="22" cy="46" r="2.5"/>
          <circle cx="32" cy="48" r="3"/>
          <circle cx="42" cy="46" r="2.5"/>
          <circle cx="27" cy="54" r="2"/>
          <circle cx="37" cy="54" r="2"/>
        </g>
      </svg>`;

    case 'thunderstorm':
      return `<svg viewBox="0 0 64 64" fill="none">
        <path d="M20 36h24a10 10 0 0 0 1.2-19.9 14 14 0 0 0-26.4-3.1A11 11 0 0 0 20 36z" fill="#475569" stroke="#334155" stroke-width="2.5"/>
        <polygon points="30,38 23,49 29,49 26,58 37,45 31,45" fill="#facc15" stroke="#eab308" stroke-width="1.5"/>
      </svg>`;

    case 'fog':
      return `<svg viewBox="0 0 64 64" fill="none">
        <path d="M22 32h20a8 8 0 0 0 1-15.9 11 11 0 0 0-20.8-2.5A8.8 8.8 0 0 0 22 32z" fill="#e2e8f0" fill-opacity="0.8" stroke="#94a3b8" stroke-width="2"/>
        <line x1="16" y1="40" x2="48" y2="40" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
        <line x1="20" y1="46" x2="44" y2="46" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
        <line x1="14" y1="52" x2="50" y2="52" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
      </svg>`;

    default:
      return getWeatherSvg('clear-day');
  }
}

// ==========================================================================
// 3. 계절 정의 & 감성 문구 & 복장 조언
// ==========================================================================
const SEASON_CONFIG = {
  spring: {
    name: '봄',
    badgeText: '화사한 봄날',
    brandIcon: '🌸',
    badgeIcon: '🌸',
    clothingTips: [
      { maxTemp: 10, title: '초봄 환절기 대비', desc: '꽃샘추위에 감기 조심하세요! 도톰한 아우터나 카디건을 챙기세요.' },
      { maxTemp: 18, title: '완연한 봄 날씨', desc: '따사로운 봄 햇살! 가벼운 자켓, 트렌치코트, 니트가 제격이에요.' },
      { maxTemp: 99, title: '초여름 기운의 봄', desc: '낮에는 제법 포근해요. 얇은 셔츠나 홑겹 겉옷을 추천합니다.' }
    ]
  },
  summer: {
    name: '여름',
    badgeText: '싱그러운 여름',
    brandIcon: '☀️',
    badgeIcon: '☀️',
    clothingTips: [
      { maxTemp: 24, title: '초여름 날씨', desc: '활동하기 쾌적한 날씨입니다. 얇은 긴팔이나 반팔을 준비하세요.' },
      { maxTemp: 30, title: '무더위 주의', desc: '통풍이 잘되는 린넨 의류와 자외선 차단제, 양산을 잊지 마세요.' },
      { maxTemp: 99, title: '폭염 주의보', desc: '시원한 실내 활동을 권장하며, 충분한 수분 섭취가 필수적입니다.' }
    ]
  },
  autumn: {
    name: '가을',
    badgeText: '깊어가는 가을',
    brandIcon: '🍁',
    badgeIcon: '🍁',
    clothingTips: [
      { maxTemp: 12, title: '늦가을 쌀쌀함', desc: '찬 바람이 불기 시작해요. 두터운 코트, 머플러로 보온을 챙기세요.' },
      { maxTemp: 19, title: '나들이 가기 좋은 가을', desc: '선선하고 상쾌한 공기! 가죽 재킷, 카디건, 맨투맨을 걸쳐보세요.' },
      { maxTemp: 99, title: '따스한 가을 햇살', desc: '일교차가 크니 가볍게 벗을 수 있는 외투를 챙기시는 게 좋습니다.' }
    ]
  },
  winter: {
    name: '겨울',
    badgeText: '포근한 겨울밤',
    brandIcon: '❄️',
    badgeIcon: '❄️',
    clothingTips: [
      { maxTemp: -5, title: '한파 주의보', desc: '롱패딩, 방한 장갑, 목도리, 핫팩 등 완전 무장이 필요한 강추위입니다.' },
      { maxTemp: 5, title: '겨울 추위 지속', desc: '보온성 높은 패딩이나 울 코트, 히트텍을 착용하세요.' },
      { maxTemp: 99, title: '비교적 포근한 겨울', desc: '적당히 쌀쌀한 겨울 날씨입니다. 코트와 목도리를 코디해보세요.' }
    ]
  }
};

/**
 * 날짜(월)와 현재 기온을 바탕으로 가장 적절한 계절 자동 판별
 */
function detectCurrentSeason(month = new Date().getMonth() + 1, temp = 15) {
  // 3~5월: 봄, 6~8월: 여름, 9~11월: 가을, 12~2월: 겨울
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function getRecommendation(season, temp) {
  const tips = SEASON_CONFIG[season].clothingTips;
  for (const tip of tips) {
    if (temp <= tip.maxTemp) return tip;
  }
  return tips[tips.length - 1];
}

// ==========================================================================
// 4. Open-Meteo API 통신 모듈
// ==========================================================================
async function fetchWeatherData(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`날씨 정보를 가져오는 데 실패했습니다 (HTTP ${response.status})`);
  }
  return await response.json();
}

async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=ko&format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (err) {
    console.error('City search failed:', err);
    return [];
  }
}

// ==========================================================================
// 5. UI 렌더링 엔진
// ==========================================================================
function updateDateTime() {
  const now = new Date();
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const dayName = days[now.getDay()];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const dtElem = document.getElementById('current-datetime');
  if (dtElem) {
    dtElem.textContent = `${year}년 ${month}월 ${date}일 ${dayName} ${hours}:${minutes}`;
  }
}

function renderWeatherUI() {
  const data = state.weatherData;
  if (!data || !data.current) return;

  const current = data.current;
  const daily = data.daily;
  const hourly = data.hourly;

  // 1. 위치 및 시간
  document.getElementById('location-name').textContent = state.currentLocation.name;
  updateDateTime();

  // 2. 현재 기온 및 날씨 상태
  const temp = Math.round(current.temperature_2m);
  const apparentTemp = Math.round(current.apparent_temperature);
  const maxTemp = Math.round(daily.temperature_2m_max[0]);
  const minTemp = Math.round(daily.temperature_2m_min[0]);
  const weatherMeta = getWeatherMeta(current.weather_code, current.is_day);

  document.getElementById('current-temp').textContent = temp;
  document.getElementById('apparent-temp').textContent = `${apparentTemp}°`;
  document.getElementById('temp-max').textContent = `${maxTemp}°`;
  document.getElementById('temp-min').textContent = `${minTemp}°`;
  document.getElementById('weather-description').textContent = weatherMeta.label;
  document.getElementById('weather-icon-wrapper').innerHTML = getWeatherSvg(weatherMeta.iconName);

  // 3. 세부 지표 (습도, 바람, 강수확률)
  const humidity = current.relative_humidity_2m;
  const wind = current.wind_speed_10m;
  const rainChance = daily.precipitation_probability_max[0] || 0;

  document.getElementById('metric-humidity').textContent = `${humidity}%`;
  document.getElementById('humidity-sub').textContent = 
    humidity > 70 ? '다소 습함 (제습 필요)' : humidity < 40 ? '건조함 (가습 권장)' : '쾌적한 적정 습도';

  document.getElementById('metric-wind').textContent = `${wind.toFixed(1)} m/s`;
  document.getElementById('wind-sub').textContent = 
    wind > 8 ? '강한 바람 주의' : wind > 4 ? '다소 바람 부는 편' : '기분 좋은 산들바람';

  document.getElementById('metric-precipitation').textContent = `${rainChance}%`;
  document.getElementById('rain-sub').textContent = 
    rainChance >= 60 ? '우산 필수!' : rainChance >= 30 ? '외출 시 작은 우산 추천' : '비 올 확률 낮음';

  // 환경 지표
  const isNight = current.is_day === 0;
  document.getElementById('metric-uv').textContent = isNight ? '밤 (자외선 없음)' : '보통 (자외선 지수 3)';
  document.getElementById('uv-sub').textContent = isNight ? '편안한 밤 시간' : '가벼운 산책 추천';

  // 4. 옷차림 추천 위젯 갱신
  renderSeasonTip(temp);

  // 5. 24시간 예보 렌더링
  renderHourlyForecast(hourly);

  // 6. 주간 7일 예보 렌더링
  renderDailyForecast(daily);
}

function renderSeasonTip(temp) {
  const currentTemp = temp !== undefined ? temp : (state.weatherData ? Math.round(state.weatherData.current.temperature_2m) : 15);
  const tip = getRecommendation(state.effectiveSeason, currentTemp);
  const cfg = SEASON_CONFIG[state.effectiveSeason];

  document.getElementById('season-badge').innerHTML = `
    <span class="season-badge-icon">${cfg.badgeIcon}</span>
    <span class="season-badge-text">${cfg.badgeText}</span>
  `;
  document.getElementById('brand-icon').textContent = cfg.brandIcon;
  document.getElementById('rec-icon').textContent = cfg.badgeIcon;
  document.getElementById('rec-title').textContent = `${cfg.name}철 옷차림 꿀팁 · ${tip.title}`;
  document.getElementById('rec-desc').textContent = tip.desc;
}

function renderHourlyForecast(hourly) {
  const container = document.getElementById('hourly-forecast-list');
  if (!container || !hourly) return;

  const currentHour = new Date().getHours();
  let html = '';

  // 향후 24시간 표시
  for (let i = 0; i < 24; i++) {
    const timeStr = hourly.time[i];
    const hourDate = new Date(timeStr);
    const hour = hourDate.getHours();
    const temp = Math.round(hourly.temperature_2m[i]);
    const code = hourly.weather_code[i];
    const isNow = i === currentHour || (i === 0 && currentHour === 0);
    const label = isNow ? '지금' : `${hour}시`;
    const meta = getWeatherMeta(code, hour >= 6 && hour < 19 ? 1 : 0);

    html += `
      <div class="hourly-card ${isNow ? 'now' : ''}">
        <span class="hourly-time">${label}</span>
        <div class="hourly-icon">${getWeatherSvg(meta.iconName)}</div>
        <span class="hourly-temp">${temp}°</span>
      </div>
    `;
  }
  container.innerHTML = html;
}

function renderDailyForecast(daily) {
  const container = document.getElementById('daily-forecast-list');
  if (!container || !daily) return;

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  let html = '';

  for (let i = 0; i < Math.min(daily.time.length, 7); i++) {
    const d = new Date(daily.time[i]);
    const dayName = i === 0 ? '오늘' : `${daysOfWeek[d.getDay()]}요일`;
    const dateStr = `${d.getMonth() + 1}.${d.getDate()}`;
    const code = daily.weather_code[i];
    const meta = getWeatherMeta(code, 1);
    const min = Math.round(daily.temperature_2m_min[i]);
    const max = Math.round(daily.temperature_2m_max[i]);

    // 기온 바 계산 (가장 추운 온도 ~ 가장 더운 온도 상대 비율)
    const barWidth = Math.min(Math.max((max - min) * 6, 25), 90);
    const barLeft = Math.max((min + 5) * 2, 5);

    html += `
      <div class="daily-row">
        <div class="daily-day-group">
          <span class="daily-day">${dayName}</span>
          <span class="daily-date">${dateStr}</span>
        </div>
        <div class="daily-weather-group">
          <div class="daily-icon">${getWeatherSvg(meta.iconName)}</div>
          <span class="daily-condition">${meta.label}</span>
        </div>
        <div class="daily-temp-bar-container">
          <span class="daily-min">${min}°</span>
          <div class="daily-bar">
            <div class="daily-bar-fill" style="margin-left: ${barLeft}%; width: ${barWidth}%;"></div>
          </div>
          <span class="daily-max">${max}°</span>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

// ==========================================================================
// 6. 계절 전환 핸들러 (Seasonal Transition Engine)
// ==========================================================================
function setSeasonMode(season) {
  state.activeSeason = season;

  if (season === 'auto') {
    const temp = state.weatherData ? state.weatherData.current.temperature_2m : 15;
    state.effectiveSeason = detectCurrentSeason(new Date().getMonth() + 1, temp);
  } else {
    state.effectiveSeason = season;
  }

  // 1. 최상위 html 속성 변경 (CSS 컬러 테마 변수 스위칭)
  document.documentElement.setAttribute('data-season', state.effectiveSeason);

  // 2. 캔버스 파티클 엔진 계절 스위칭
  if (window.seasonParticles) {
    window.seasonParticles.setSeason(state.effectiveSeason);
  }

  // 3. 탭 버튼 활성화 상태 표시
  document.querySelectorAll('.season-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.season === season);
  });

  // 4. 감성 팁 & 배지 갱신
  renderSeasonTip();

  // 사용자 선호 계절 로컬스토리지 보관
  localStorage.setItem('preferred_season', season);
}

// ==========================================================================
// 7. 날씨 로드 및 지오로케이션
// ==========================================================================
async function loadWeather(lat, lon, locationName) {
  const statusElem = document.getElementById('status-container');
  const statusMsg = document.getElementById('status-message');

  try {
    statusElem.classList.remove('hidden');
    statusMsg.textContent = `${locationName || '선택한 지역'}의 날씨를 조회하고 있습니다...`;

    state.currentLocation.lat = lat;
    state.currentLocation.lon = lon;
    if (locationName) state.currentLocation.name = locationName;

    const data = await fetchWeatherData(lat, lon);
    state.weatherData = data;

    // 만약 현재 계절 모드가 'auto'라면 새 날씨 데이터에 맞게 재계산
    if (state.activeSeason === 'auto') {
      setSeasonMode('auto');
    }

    renderWeatherUI();
    localStorage.setItem('last_city', JSON.stringify(state.currentLocation));
  } catch (error) {
    console.error('Weather load error:', error);
    alert('날씨 데이터를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  } finally {
    statusElem.classList.add('hidden');
  }
}

function handleGeolocation() {
  if (!navigator.geolocation) {
    alert('이 브라우저는 현재 위치 확인 기능을 지원하지 않습니다.');
    return;
  }

  const statusElem = document.getElementById('status-container');
  const statusMsg = document.getElementById('status-message');
  statusElem.classList.remove('hidden');
  statusMsg.textContent = '현재 GPS 위치를 확인하고 있습니다...';

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      // 역지오코딩 또는 위치명 지정
      let cityName = '내 현재 위치';
      try {
        const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=ko`;
        const res = await fetch(revUrl);
        if (res.ok) {
          const revData = await res.json();
          cityName = revData.address.city || revData.address.borough || revData.address.county || revData.address.state || '내 현재 위치';
        }
      } catch (e) {
        cityName = '내 현재 위치';
      }

      // 추천 칩 활성화 해제
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));

      await loadWeather(lat, lon, cityName);
    },
    (error) => {
      statusElem.classList.add('hidden');
      let msg = '위치 권한을 확인할 수 없습니다.';
      if (error.code === error.PERMISSION_DENIED) {
        msg = '위치 정보 접근 권한이 허용되지 않았습니다. 브라우저 설정에서 위치 권한을 확인해주세요.';
      }
      alert(msg);
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

// ==========================================================================
// 8. 검색 자동완성 & 이벤트 바인딩
// ==========================================================================
let searchDebounceTimeout = null;

function setupSearch() {
  const searchInput = document.getElementById('city-search-input');
  const clearBtn = document.getElementById('clear-search-btn');
  const dropdown = document.getElementById('search-results-dropdown');

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    clearBtn.classList.toggle('hidden', val.length === 0);

    clearTimeout(searchDebounceTimeout);
    if (val.trim().length < 2) {
      dropdown.classList.add('hidden');
      dropdown.innerHTML = '';
      return;
    }

    searchDebounceTimeout = setTimeout(async () => {
      const results = await searchCities(val);
      if (results.length === 0) {
        dropdown.innerHTML = '<li style="cursor:default; color:var(--theme-text-muted);">검색 결과가 없습니다.</li>';
        dropdown.classList.remove('hidden');
        return;
      }

      dropdown.innerHTML = results.map(city => {
        const country = city.country ? ` · ${city.country}` : '';
        const admin = city.admin1 ? ` (${city.admin1})` : '';
        return `
          <li data-lat="${city.latitude}" data-lon="${city.longitude}" data-name="${city.name}${country}">
            <span class="dropdown-city-name">${city.name}${admin}</span>
            <span class="dropdown-country">${city.country || ''}</span>
          </li>
        `;
      }).join('');
      dropdown.classList.remove('hidden');
    }, 280);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.add('hidden');
    dropdown.classList.add('hidden');
    searchInput.focus();
  });

  dropdown.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li || !li.dataset.lat) return;

    const lat = parseFloat(li.dataset.lat);
    const lon = parseFloat(li.dataset.lon);
    const name = li.dataset.name;

    searchInput.value = name;
    dropdown.classList.add('hidden');

    // 추천 칩 선택 상태 해제
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));

    loadWeather(lat, lon, name);
  });

  // 검색창 바깥 클릭 시 드롭다운 닫기
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar-container')) {
      dropdown.classList.add('hidden');
    }
  });

  // 엔터 키 입력 시 첫 번째 결과 자동 선택
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const firstLi = dropdown.querySelector('li[data-lat]');
      if (firstLi) {
        firstLi.click();
      }
    }
  });
}

function setupEventListeners() {
  // 계절 버튼 클릭
  document.querySelectorAll('.season-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const season = btn.dataset.season;
      setSeasonMode(season);
    });
  });

  // 추천 도시 칩 클릭
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const lat = parseFloat(chip.dataset.lat);
      const lon = parseFloat(chip.dataset.lon);
      const name = `${chip.dataset.name}, 대한민국`;
      loadWeather(lat, lon, chip.dataset.name);
    });
  });

  // 내 위치 버튼 클릭
  const geoBtn = document.getElementById('geo-location-btn');
  if (geoBtn) {
    geoBtn.addEventListener('click', handleGeolocation);
  }

  // 1분마다 시계 업데이트
  setInterval(updateDateTime, 60000);
}

// ==========================================================================
// 9. 초기화 (Init)
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
  setupSearch();
  setupEventListeners();

  // 저장된 계절 선호도 불러오기 (기본값 'auto')
  const savedSeason = localStorage.getItem('preferred_season') || 'auto';
  setSeasonMode(savedSeason);

  // 저장된 마지막 도시 확인 또는 기본 서울 로드
  const savedCity = localStorage.getItem('last_city');
  if (savedCity) {
    try {
      const parsed = JSON.parse(savedCity);
      loadWeather(parsed.lat, parsed.lon, parsed.name);
      return;
    } catch (e) {
      // 무시하고 서울 로드
    }
  }

  // 기본 서울 날씨 불러오기
  loadWeather(state.currentLocation.lat, state.currentLocation.lon, '서울, 대한민국');
});
