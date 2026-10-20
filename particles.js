/**
 * 사계절 파티클 캔버스 효과 (Seasonal Particle Canvas System)
 * 봄: 흩날리는 벚꽃잎 (Cherry Blossom Petals)
 * 여름: 찬란한 여름 햇살과 반딧불이 빛 (Sun Dust & Firefly Sparkles)
 * 가을: 바람에 날리는 붉은 단풍잎과 은행잎 (Maple & Ginkgo Leaves)
 * 겨울: 포근하게 내리는 함박눈 (Realistic Snowflakes)
 */

class SeasonParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    this.currentSeason = 'spring';
    this.particles = [];
    this.maxParticles = 55;
    this.mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
    this.lastMouse = { x: 0, y: 0 };
    this.wind = 0.5;
    this.time = 0;
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // 마우스 바람 인터랙션
    window.addEventListener('mousemove', (e) => {
      this.mouse.vx = (e.clientX - this.lastMouse.x) * 0.05;
      this.mouse.vy = (e.clientY - this.lastMouse.y) * 0.05;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.lastMouse.x = e.clientX;
      this.lastMouse.y = e.clientY;
    });

    this.spawnParticles();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  setSeason(season) {
    if (this.currentSeason === season) return;
    this.currentSeason = season;
    // 부드러운 전환을 위해 기존 파티클들을 점진적으로 대체
    this.particles.forEach(p => {
      p.fadingOut = true;
    });
  }

  createParticle(season = this.currentSeason) {
    const p = {
      x: Math.random() * this.width,
      y: Math.random() * -50,
      size: 0,
      speedY: 0,
      speedX: 0,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      swayOffset: Math.random() * 100,
      swaySpeed: 0.015 + Math.random() * 0.02,
      opacity: 0,
      targetOpacity: 0.7 + Math.random() * 0.3,
      fadingOut: false,
      season: season,
      color: '',
      type: Math.floor(Math.random() * 2)
    };

    switch (season) {
      case 'spring': // 벚꽃잎
        p.size = 9 + Math.random() * 11;
        p.speedY = 1.0 + Math.random() * 1.6;
        p.speedX = 0.8 + Math.random() * 1.2;
        p.colors = [
          'rgba(255, 183, 197, ', // 연분홍
          'rgba(255, 192, 203, ', // 핑크
          'rgba(255, 218, 224, ', // 화이트 핑크
          'rgba(244, 143, 177, '  // 진분홍
        ];
        p.baseColor = p.colors[Math.floor(Math.random() * p.colors.length)];
        break;

      case 'summer': // 빛가루 / 반딧불이
        p.x = Math.random() * this.width;
        p.y = Math.random() * this.height;
        p.size = 2 + Math.random() * 4.5;
        p.speedY = -0.3 + (Math.random() - 0.5) * 0.6;
        p.speedX = (Math.random() - 0.5) * 0.8;
        p.pulseSpeed = 0.03 + Math.random() * 0.04;
        p.colors = [
          'rgba(254, 240, 138, ', // 골든 옐로우
          'rgba(250, 204, 21, ',  // 맑은 태양광
          'rgba(186, 230, 253, ', // 하늘빛 산들바람
          'rgba(255, 255, 255, '  // 화이트 스파클
        ];
        p.baseColor = p.colors[Math.floor(Math.random() * p.colors.length)];
        break;

      case 'autumn': // 단풍 & 은행잎
        p.size = 14 + Math.random() * 14;
        p.speedY = 1.4 + Math.random() * 2.2;
        p.speedX = 0.9 + Math.random() * 1.8;
        p.rotationSpeed = (Math.random() - 0.5) * 0.05;
        p.colors = [
          'rgba(220, 38, 38, ',  // 단풍 레드
          'rgba(234, 88, 12, ',  // 주황
          'rgba(245, 158, 11, ', // 황금 단풍
          'rgba(202, 138, 4, '   // 은행잎 옐로우
        ];
        p.baseColor = p.colors[Math.floor(Math.random() * p.colors.length)];
        break;

      case 'winter': // 눈송이
        p.size = 2.5 + Math.random() * 5.5;
        p.speedY = 0.8 + Math.random() * 1.6;
        p.speedX = (Math.random() - 0.5) * 0.8;
        p.baseColor = 'rgba(255, 255, 255, ';
        p.targetOpacity = 0.4 + Math.random() * 0.55;
        break;
    }

    return p;
  }

  spawnParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.createParticle();
      p.y = Math.random() * this.height; // 초기 위치 무작위 분포
      p.opacity = p.targetOpacity;
      this.particles.push(p);
    }
  }

  drawSpringPetal(p) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(Math.cos(p.rotation * 0.8), 1); // 3차원 펄럭임 효과

    ctx.fillStyle = p.baseColor + p.opacity + ')';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
    ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
    ctx.fill();

    // 꽃잎 중심선
    ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * 0.4})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(0, p.size * 0.75);
    ctx.stroke();

    ctx.restore();
  }

  drawSummerSparkle(p) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(p.x, p.y);

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
    glow.addColorStop(0, p.baseColor + p.opacity + ')');
    glow.addColorStop(0.5, p.baseColor + (p.opacity * 0.4) + ')');
    glow.addColorStop(1, p.baseColor + '0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
    ctx.fill();

    // 중심 빛 핵
    ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
    ctx.beginPath();
    ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawAutumnLeaf(p) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(Math.cos(p.rotation * 0.6), 1);

    ctx.fillStyle = p.baseColor + p.opacity + ')';

    if (p.type === 0) {
      // 은행잎 (Ginkgo) 부채꼴 모양
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, -p.size * 0.6, p.size * 0.8, 0.4 * Math.PI, 0.6 * Math.PI, true);
      ctx.closePath();
      ctx.fill();
    } else {
      // 단풍잎 (Maple) 잎맥 모양
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size * 0.35, -p.size * 0.3);
      ctx.lineTo(p.size * 0.8, -p.size * 0.4);
      ctx.lineTo(p.size * 0.4, 0.1 * p.size);
      ctx.lineTo(p.size * 0.6, p.size * 0.7);
      ctx.lineTo(0, p.size * 0.4);
      ctx.lineTo(-p.size * 0.6, p.size * 0.7);
      ctx.lineTo(-p.size * 0.4, 0.1 * p.size);
      ctx.lineTo(-p.size * 0.8, -p.size * 0.4);
      ctx.lineTo(-p.size * 0.35, -p.size * 0.3);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  drawWinterSnow(p) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(p.x, p.y);

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.5);
    glow.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
    glow.addColorStop(0.6, `rgba(224, 231, 255, ${p.opacity * 0.5})`);
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, p.size * 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  update() {
    this.time += 0.02;
    this.wind = Math.sin(this.time * 0.5) * 0.8;

    // 마우스 가속도 감쇠
    this.mouse.vx *= 0.92;
    this.mouse.vy *= 0.92;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // 페이드 인 / 아웃 처리
      if (p.fadingOut) {
        p.opacity -= 0.025;
        if (p.opacity <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
      } else if (p.opacity < p.targetOpacity) {
        p.opacity += 0.02;
      }

      // 계절별 물리 동작
      if (p.season === 'summer') {
        p.x += p.speedX + Math.sin(this.time + p.swayOffset) * 0.4 + this.mouse.vx;
        p.y += p.speedY + Math.cos(this.time + p.swayOffset) * 0.4 + this.mouse.vy;
        p.opacity = (Math.sin(this.time * 2 + p.swayOffset) * 0.3 + 0.6) * p.targetOpacity;

        // 경계 반사
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;
      } else {
        const sway = Math.sin(this.time * p.swaySpeed + p.swayOffset) * 1.2;
        p.x += p.speedX + this.wind + sway + this.mouse.vx;
        p.y += p.speedY + this.mouse.vy;
        p.rotation += p.rotationSpeed;

        // 화면 밖으로 나갔을 때 재배치
        if (p.y > this.height + 40 || p.x > this.width + 50 || p.x < -50) {
          if (p.season !== this.currentSeason) {
            this.particles.splice(i, 1);
            continue;
          }
          p.y = -30;
          p.x = Math.random() * (this.width + 100) - 50;
        }
      }
    }

    // 현재 계절 파티클 보충
    while (this.particles.length < this.maxParticles) {
      this.particles.push(this.createParticle(this.currentSeason));
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (const p of this.particles) {
      switch (p.season) {
        case 'spring':
          this.drawSpringPetal(p);
          break;
        case 'summer':
          this.drawSummerSparkle(p);
          break;
        case 'autumn':
          this.drawAutumnLeaf(p);
          break;
        case 'winter':
          this.drawWinterSnow(p);
          break;
      }
    }
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// 전역 인스턴스 초기화
let seasonParticles;
window.addEventListener('DOMContentLoaded', () => {
  seasonParticles = new SeasonParticleSystem('season-canvas');
});
