const { useState, useEffect } = React;

// ==================== データ ====================
const COMPANIES = [
  {
    id: 'ihin-seiriya',
    rank: 1,
    name: '遺品の整理屋さん',
    catch: '遺品整理・買取・清掃をワンストップで対応（自社施工）',
    price: '1K 27,000円〜',
    features: ['遺品整理・買取・清掃', '料金表を公式公開', '対応実績3万件超', '広域対応'],
    area: '広域対応（要確認）',
    tel: '公式サイトを確認',
    time: '公式サイトを確認',
    reviewUrl: 'review.html'
  },
  {
    id: 'shichifukujin',
    rank: 2,
    name: 'ゴミ屋敷片付け七福神',
    catch: 'ゴミ屋敷・不用品回収・清掃の対応範囲が広い（自社施工）',
    price: '1R/1K 14,900円〜',
    features: ['ゴミ屋敷対応', '単品〜4LDK', '追加料金なし訴求', '遺品整理も対応'],
    area: '関東・関西・中部・東北など',
    tel: '公式サイトを確認',
    time: '公式サイトを確認',
    reviewUrl: 'review-777fukujin.html'
  },
  {
    id: 'life-reset',
    rank: 3,
    name: 'ライフリセット',
    catch: '最低料金が明確・見積もり/出張費/キャンセル料 無料訴求',
    price: '1K 22,000円〜',
    features: ['遺品整理・特殊清掃', '見積もり無料', '出張費無料', 'キャンセル料無料'],
    area: '全国（要確認）',
    tel: '公式サイトを確認',
    time: '公式サイトを確認',
    reviewUrl: 'review-liferesetro.html'
  },
  {
    id: 'emeao',
    rank: 4,
    name: '遺品整理110番',
    catch: '全国対応・24時間365日受付・最短即日対応（紹介型）',
    price: '16,500円〜',
    features: ['24時間365日受付', '最短即日対応', '全国加盟店', '紹介・加盟店型'],
    area: '全国（加盟店）',
    tel: '公式サイトを確認',
    time: '24時間365日',
    reviewUrl: '#'
  },
  {
    id: 'minnano',
    rank: 5,
    name: 'みんなの遺品整理',
    catch: '認定業者を掲載する一括見積もりサービス',
    price: '提携業者次第',
    features: ['認定業者を掲載', '一括見積もり', '複数社比較', '紹介型'],
    area: '全国',
    tel: '公式サイトを確認',
    time: '公式サイトを確認',
    reviewUrl: '#'
  },
  {
    id: 'emeao',
    rank: 6,
    name: 'EMEAO（イーミーオ）',
    catch: 'コンシェルジュが審査済み業者を紹介するBtoBマッチング',
    price: '1K 40,000円〜',
    features: ['審査済み業者', 'コンシェルジュ相談', '最大8社紹介', '利用者無料'],
    area: '依頼地域による',
    tel: '公式サイトを確認',
    time: '公式サイトを確認',
    reviewUrl: '#'
  }
];

const ARTICLES = [
  { tag: '遺品整理', title: '遺品整理業者の料金相場は？間取り別・地域別に徹底解説【2026年最新】', meta: '2026.09.05 / 12,543view', cat: '料金', url: 'article-ihin-price.html' },
  { tag: '選び方', title: '悪徳業者に注意！信頼できる遺品整理業者を見分ける7つのポイント', meta: '2026.09.01 / 8,921view', cat: '選び方', url: 'article-akutoku.html' },
  { tag: '生前整理', title: '50代から始める生前整理｜家族に迷惑をかけない終活のはじめ方', meta: '2026.08.28 / 15,203view', cat: '生前整理', url: 'article-seizen.html' },
  { tag: '不用品回収', title: '不用品回収の相場と安く抑えるコツ。自治体との違いも比較', meta: '2026.08.25 / 6,742view', cat: 'コスト', url: 'article-huyouhin.html' },
  { tag: 'ゴミ屋敷', title: 'ゴミ屋敷の片付け費用はいくら？1K〜4LDKまで料金目安まとめ', meta: '2026.08.20 / 9,884view', cat: '料金', url: 'article-gomiyashiki.html' },
  { tag: 'ハウスクリーニング', title: 'ハウスクリーニングサービス比較5社｜引越し前後・空室・水回りを整理', meta: '2026.09.08 最終確認', cat: '清掃', url: 'ranking-cleaning.html' }
];

const WORRIES = [
  '実家の遺品整理、何から手をつけていいかわからない',
  '業者の相場がわからず、ぼったくられそうで不安',
  '仕事があって現地に行けない・遠方に住んでいる',
  '故人の思い出の品を大切に扱ってほしい',
  '大量の不用品を一気に処分したい',
  '女性スタッフに対応してもらいたい'
];

// ==================== 共通コンポーネント ====================
// ★スコアは公式データではなく編集部の推定になるため非表示化
function Stars({ score }) {
  return null;
}

function Placeholder({ label, warm }) {
  return <div className={`ph ${warm ? 'warm' : ''}`}>[ {label} ]</div>;
}

function RankBadge({ rank }) {
  const label = rank === 1 ? '第' : rank === 2 ? '第' : rank === 3 ? '第' : '第';
  return (
    <div className={`rank-badge rank-${rank}`}>
      <span>
        <span className="no">No.</span>
        <span className="num">{rank}</span>
      </span>
    </div>
  );
}

function Breadcrumb() {
  return (
    <div className="breadcrumb">
      <a href="#">HOME</a>
      <span className="sep">›</span>
      <span>総合トップ</span>
    </div>
  );
}

// ==================== 案A: 王道メディア型 ====================
function VariantA() {
  return (
    <div className="variant-a" data-screen-label="01 案A 王道メディア型">
      <section className="hero" data-screen-label="Hero A">
        <div className="hero-inner">
          <div>
            <span className="hero-tag">2026年9月 最新更新</span>
            <h1>
              <mark>遺品整理・生前整理・不用品回収</mark><br />
              の信頼できる業者を厳選して比較しました
            </h1>
            <p>「どこに頼めばいいの？」「料金が不安…」そんなお悩みに、本当におすすめできる業者だけを、料金・対応・口コミから丁寧に比較しました。</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="ranking.html" className="btn-cta">
                ランキングを見る<span className="arrow">→</span>
              </a>
              <a href="#" className="btn-secondary">料金相場をチェック</a>
            </div>

          </div>
          <div className="hero-img">
            <div className="decoration"></div>
            <Placeholder label="ヒーロー写真: 明るい部屋で片付ける家族の様子" />
          </div>
        </div>
      </section>

      <main className="container">
        {/* カテゴリ */}
        <div className="section-head">
          <h2>お悩み別に探す</h2>
        </div>
        <div className="topic-list">
          {[
            { title: '遺品整理', desc: '故人の遺品を丁寧に' },
            { title: '生前整理', desc: '元気なうちに始める' },
            { title: '不用品回収', desc: '大量処分もOK' },
            { title: 'ハウスクリーニング', desc: '空き家・引越し前に' }
          ].map((t, i) => (
            <a key={i} href="#" className="topic-list-item">
              <div className="title">{t.title}</div>
              <div className="desc">{t.desc}</div>
            </a>
          ))}
        </div>

        {/* お悩みリスト */}
        <div className="worries">
          <h3>こんなお悩み、ありませんか？</h3>
          <div className="worry-list">
            {WORRIES.map((w, i) => <div key={i} className="worry-item">{w}</div>)}
          </div>
          <p style={{textAlign:'center', marginTop:'20px', fontSize:'14px', color:'var(--text-sub)'}}>
            当サイトなら、あなたにぴったりの業者がきっと見つかります。
          </p>
        </div>

        {/* ランキング */}
        <div className="section-head">
          <h2>おすすめ業者ランキング TOP7</h2>
          <p>料金・対応の丁寧さ・口コミ評価を総合的に判定</p>
        </div>
        <div className="ranking-list">
          {COMPANIES.slice(0, 3).map(c => (
            <div key={c.id} className={`ranking-item ${c.rank === 1 ? 'top' : ''}`}>
              <RankBadge rank={c.rank} />
              <div className="ranking-thumb">
                <Placeholder label={`${c.name}\nサービス写真`} warm={c.rank === 1} />
              </div>
              <div className="ranking-info">
                <h3>{c.name}</h3>
                <div className="ranking-catch">{c.catch}</div>
                <div className="ranking-features">
                  {c.features.map((f, i) => <span key={i} className="feat-tag">{f}</span>)}
                </div>
                <dl className="ranking-detail" style={{gridTemplateColumns:'auto 1fr', gap:'4px 12px', display:'grid'}}>
                  <dt>対応エリア</dt><dd>{c.area}</dd>
                  <dt>受付時間</dt><dd>{c.time}</dd>
                </dl>
              </div>
              <div className="ranking-actions">
                <div className="ranking-price">
                  料金目安（公式掲載）<br />
                  <strong>{c.price}</strong>
                </div>
                <a href={c.reviewUrl !== '#' ? c.reviewUrl : '#'} className="btn-cta">
                  {c.reviewUrl !== '#' ? '詳細レビュー' : '公式サイトを見る'}<span className="arrow">→</span>
                </a>
                {c.reviewUrl !== '#' && (
                  <a href="#" className="btn-secondary" style={{fontSize:'12px', padding:'8px'}}>
                    公式サイトを見る
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center', marginBottom:'40px'}}>
          <a href="ranking.html" className="btn-secondary">4位〜7位も見る →</a>
        </div>

        {/* 記事一覧 */}
        <div className="section-head">
          <h2>新着・人気記事</h2>
        </div>
        <div className="article-grid">
          {ARTICLES.slice(0, 6).map((a, i) => (
            <a key={i} href={a.url || "#"} className="article-card">
              <div className="thumb">
                <span className="tag">{a.tag}</span>
                <Placeholder label={a.cat} />
              </div>
              <div className="body">
                <h3>{a.title}</h3>
                <div className="meta"><span>{a.meta.split('/')[0]}</span><span>{a.meta.split('/')[1]}</span></div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}

// ==================== 案B: 雑誌型 ====================
function VariantB() {
  return (
    <div className="variant-b" data-screen-label="02 案B 雑誌型">
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-issue">
            <span className="issue-num">2026年 秋号</span>
            <span>今月の特集</span>
            <span style={{marginLeft:'auto'}}>くらしの整理ナビ</span>
          </div>
          <div className="hero-grid">
            <div className="hero-feature">
              <Placeholder label="特集メイン写真\n温かい家庭の風景" />
            </div>
            <div className="hero-copy">
              <div className="feat-label">特集</div>
              <h1>
                大切な人を送ったあとに、<br />
                <span className="accent">「整える」</span>という選択。
              </h1>
              <p>親の遺品整理、実家の片付け、そして自分自身の生前整理。人生の節目にそっと寄り添う、信頼できる業者を編集部が厳選しました。</p>
              <a href="ranking.html" className="btn-cta">特集を読む<span className="arrow">→</span></a>
            </div>
          </div>
        </div>
      </section>

      <main className="container">
        <div className="magazine-grid">
          <a href="ranking.html" className="mag-card-big">
            <div className="thumb"><Placeholder label="特集記事のカバー写真" /></div>
            <div className="body">
              <div className="mag-cat">業者比較</div>
              <h3>【2026年最新】遺品整理業者おすすめ7社｜料金・対応エリア・特徴で比較</h3>
              <p style={{fontSize:'13px', color:'var(--text-sub)', margin:0, lineHeight:1.8}}>料金・対応・特徴を整理して比較。知名度と実績のある7社をご紹介します。</p>
            </div>
          </a>
          <div className="mag-card-side">
            {ARTICLES.slice(0, 3).map((a, i) => (
              <a key={i} href={a.url || "#"} className="mag-card-row">
                <div className="thumb"><Placeholder label={a.cat} /></div>
                <div className="body">
                  <div className="mag-cat">{a.tag}</div>
                  <h3>{a.title}</h3>
                  <div style={{fontSize:'11px', color:'var(--muted)'}}>{a.meta}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="section-head">
          <h2>今月のおすすめ業者</h2>
          <p>知名度と実績のあるサービスから3社をピックアップしました</p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px', marginBottom:'40px'}}>
          {COMPANIES.slice(0, 3).map(c => (
            <div key={c.id} style={{background:'white', borderRadius:'12px', overflow:'hidden', border:'1px solid var(--border)'}}>
              <div style={{aspectRatio:'4/3', position:'relative'}}>
                <Placeholder label={c.name} />
                <div style={{position:'absolute', top:'12px', left:'12px'}}>
                  <RankBadge rank={c.rank} />
                </div>
              </div>
              <div style={{padding:'18px 20px 20px'}}>
                <div className="mag-cat">掲載業者</div>
                <h3 style={{fontSize:'17px', marginBottom:'8px'}}>{c.name}</h3>
                <div style={{fontSize:'13px', color:'var(--accent-dark)', fontWeight:700, marginBottom:'10px'}}>{c.catch}</div>
                <div style={{fontSize:'12px', color:'var(--muted)', marginBottom:'14px'}}>料金目安（公式掲載）: <b style={{color:'var(--accent-dark)', fontSize:'14px'}}>{c.price}</b></div>
                <a href={c.reviewUrl !== '#' ? c.reviewUrl : '#'} className="btn-cta full">{c.reviewUrl !== '#' ? '詳細レビュー' : '公式サイト'} →</a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Spotlight */}
      <section className="spotlight">
        <div className="container">
          <div className="section-head" style={{marginTop:0, borderBottomColor:'rgba(255,255,255,0.15)'}}>
            <h2 style={{color:'white'}}>こんな悩みが、このページで解決します</h2>
          </div>
          <div className="worries">
            <div className="worry-list">
              {WORRIES.map((w, i) => <div key={i} className="worry-item">{w}</div>)}
            </div>
          </div>
          <div style={{textAlign:'center', marginTop:'32px'}}>
            <a href="ranking.html" className="btn-cta large">おすすめ業者を見る<span className="arrow">→</span></a>
          </div>
        </div>
      </section>

      <main className="container">
        <div className="section-head">
          <h2>もっと読む</h2>
        </div>
        <div className="article-grid" style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px', marginBottom:'40px'}}>
          {ARTICLES.slice(3, 6).map((a, i) => (
            <a key={i} href={a.url || "#"} className="article-card">
              <div className="thumb">
                <span className="tag">{a.tag}</span>
                <Placeholder label={a.cat} />
              </div>
              <div className="body">
                <h3>{a.title}</h3>
                <div className="meta"><span>{a.meta.split('/')[0]}</span><span>{a.meta.split('/')[1]}</span></div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}

// ==================== 案C: 検索起点型 ====================
function VariantC() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState({});

  const questions = [
    {
      q: 'どんな整理をお考えですか？',
      choices: [
        { label: '遺品整理' },
        { label: '生前整理' },
        { label: '不用品回収' },
        { label: 'ハウスクリーニング' }
      ]
    },
    {
      q: '対象となるお部屋の間取りは？',
      choices: [
        { label: '1R・1K' },
        { label: '1DK〜2LDK' },
        { label: '3LDK〜' },
        { label: 'まだ決めていない' }
      ]
    },
    {
      q: '重視するポイントは？',
      choices: [
        { label: '料金の安さ' },
        { label: 'スピード対応' },
        { label: '丁寧な対応' },
        { label: '女性スタッフ' }
      ]
    }
  ];

  const currentQ = questions[step - 1];

  const handleChoice = (label) => {
    setSelected({ ...selected, [step]: label });
    if (step < 3) setTimeout(() => setStep(step + 1), 200);
  };

  return (
    <div className="variant-c" data-screen-label="03 案C 検索起点型">
      <section className="hero">
        <div className="hero-inner">
          <h1>あなたにぴったりの整理業者、<br />30秒でわかります。</h1>
          <p>簡単な3ステップの質問に答えるだけで、編集部おすすめの業者をご提案します。</p>

          <div className="diagnostic">
            <div className="diag-meta">
              <span>STEP {step} / 3</span>
              <span>あと {3 - step + 1}問</span>
            </div>
            <div className="diag-progress">
              <div className="diag-progress-bar" style={{width: `${(step / 3) * 100}%`}}></div>
            </div>
            <div className="diag-step">
              <span className="diag-step-num">{step}</span>
              STEP {step}
            </div>
            <div className="diag-q">{currentQ.q}</div>
            <div className="diag-choices">
              {currentQ.choices.map((c, i) => (
                <button
                  key={i}
                  className={`diag-choice ${selected[step] === c.label ? 'selected' : ''}`}
                  onClick={() => handleChoice(c.label)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {step === 3 && selected[3] && (
              <div style={{textAlign:'center', marginTop:'16px'}}>
                <a href="ranking.html" className="btn-cta large">おすすめ業者を見る →</a>
              </div>
            )}
          </div>

          <div className="trust-strip">
            <div className="trust-item">診断・見積もり完全無料</div>
            <div className="trust-item">個人情報保護</div>
            <div className="trust-item">最短30秒</div>
            <div className="trust-item">全国対応</div>
          </div>
        </div>
      </section>

      <main className="container">
        <div className="section-head">
          <h2>今月の人気ランキング</h2>
          <p>実際に利用者から選ばれている業者TOP7</p>
        </div>
        <div className="compact-ranking">
          {COMPANIES.map(c => (
            <a key={c.id} href={c.reviewUrl !== '#' ? c.reviewUrl : '#'} className="compact-item">
              <RankBadge rank={c.rank} />
              <div className="info">
                <h4>{c.name}</h4>
                <div style={{fontSize:'12px', color:'var(--text-sub)', marginBottom:'4px'}}>{c.catch}</div>
                <div className="price">料金目安：<b>{c.price}</b> / {c.area}</div>
              </div>
            </a>
          ))}
        </div>

        <div style={{textAlign:'center', marginBottom:'40px'}}>
          <a href="ranking.html" className="btn-cta">詳しい比較表を見る<span className="arrow">→</span></a>
        </div>

        <div className="section-head">
          <h2>失敗しないための基礎知識</h2>
        </div>
        <div className="article-grid">
          {ARTICLES.slice(0, 3).map((a, i) => (
            <a key={i} href={a.url || "#"} className="article-card">
              <div className="thumb">
                <span className="tag">{a.tag}</span>
                <Placeholder label={a.cat} />
              </div>
              <div className="body">
                <h3>{a.title}</h3>
                <div className="meta"><span>{a.meta.split('/')[0]}</span></div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}

// ==================== メインアプリ ====================
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "A"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <>
      <Breadcrumb />
      {tweaks.variant === 'A' && <VariantA />}
      {tweaks.variant === 'B' && <VariantB />}
      {tweaks.variant === 'C' && <VariantC />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="デザイン案">
          <TweakRadio
            label="デザインバリエーション"
            value={tweaks.variant}
            onChange={(v) => setTweak('variant', v)}
            options={[
              { value: 'A', label: 'A. 王道メディア' },
              { value: 'B', label: 'B. 雑誌型' },
              { value: 'C', label: 'C. 診断起点' }
            ]}
          />
        </TweakSection>
        <TweakSuggestionBar suggestions={[
          '色をもう少し温かみのある感じに変えて',
          'ヒーロー写真の場所を実際の写真に差し替えて',
          '女性スタッフの吹き出しを追加して',
          'ランキング1位をもっと目立たせて'
        ]} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
