/* ==========================================================================
   JavaScript 應用邏輯 - MysticTarot (線上塔羅牌)
   核心演算法：22張大阿爾克那資料庫、隨機洗牌演算法、3D翻牌狀態監聽、牌意解析渲染
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 占卜模式與 UI 切換
    const btnModeSingle = document.getElementById('mode-single');
    const btnModeThree = document.getElementById('mode-three');
    const spreadSingleBox = document.getElementById('spread-single-box');
    const spreadThreeBox = document.getElementById('spread-three-box');
    
    // 控制按鈕
    const btnShuffle = document.getElementById('btn-shuffle');
    const stepText = document.getElementById('step-text');
    const interpretationSection = document.getElementById('interpretation-section');
    const readingsContainer = document.getElementById('readings-container');

    // 當前模式: 'single' (單牌) 或 'three' (三牌)
    let currentMode = 'single';
    // 是否已經洗牌
    let isShuffled = false;
    // 已點擊翻開的牌卡數量
    let flippedCount = 0;
    // 本次占卜抽取到的卡牌資料
    let drawnCards = [];

    // ==========================================================================
    // 1. 22張大阿爾克那塔羅牌資料庫
    // ==========================================================================
    const tarotDeck = [
        {
            id: 0, name: "愚者 (The Fool)", icon: "fa-compass",
            uprightKeyword: "冒險、全新開始、天真自由",
            reversedKeyword: "魯莽、逃避責任、盲目冒險",
            uprightDesc: "愚者代表一個全新旅程的起點。你帶著純真的熱情與勇氣，準備迎接未知的世界。正位提示你要放下過去的束縛，大膽跨出舒適圈，相信宇宙會給你最好的安排。這是一個非常適合開始新計劃、新感情或展開冒險的時刻。",
            reversedDesc: "逆位的愚者警示你可能有些急躁和魯莽。你急於跨出腳步，卻忽視了潛在的風險與警告。你需要冷靜下來，審視自己是否在逃避某些現實責任，或是盲目樂觀。請在做決定前做好充分準備，避免衝動行事。"
        },
        {
            id: 1, name: "魔術師 (The Magician)", icon: "fa-wand-magic-sparkles",
            uprightKeyword: "創造力、主動性、才能展現",
            reversedKeyword: "欺騙、有才無用、溝通不良",
            uprightDesc: "魔術師代表萬事俱備，你擁有一切所需的資源與才能。此時是將想法轉化為行動的黃金時期。正位提示你發揮你的溝通能力、意志力與專注度，主動去創造你想要的結果。你就是自己人生的魔法師，力量已在手中。",
            reversedDesc: "逆位的魔術師暗示你可能擁有才能卻未充分發揮，或是有人在用虛假的手段欺騙你。這代表能量的浪費或溝通上的障礙。你需要重新檢視自己是否缺乏專注，或者身邊是否有口蜜腹劍的人，請誠實地面對現狀。"
        },
        {
            id: 2, name: "女祭司 (The High Priestess)", icon: "fa-book",
            uprightKeyword: "直覺、潛意識、靜止、智慧",
            reversedKeyword: "情緒壓抑、忽視直覺、膚淺淺薄",
            uprightDesc: "女祭司代表內在的直覺與深沉的智慧。正位提示你此時不宜急於採取行動，而是應該靜下心來聆聽內在的聲音。相信你的潛意識，答案已經在你的心中。這也是適合學習神祕學、心理學或靜坐冥想的靜心時刻。",
            reversedDesc: "逆位的女祭司警告你可能過於忽視自己的直覺，或者被表面的事物所迷惑。這有時也代表內心情緒的過度壓抑或焦慮。請嘗試放下大腦的理性分析，重新與自己深層的心靈連結，誠實地面對內心渴望。"
        },
        {
            id: 3, name: "皇后 (The Empress)", icon: "fa-crown",
            uprightKeyword: "豐收、母性、感官享受、創造力",
            reversedKeyword: "過度控制、浪費、創造力受阻",
            uprightDesc: "皇后代表大自然與母性的豐收能量。正位象徵著富足、繁衍、與感官的滿足。此時在感情、事業或藝術創作上都非常容易開花結果。這也提示你多親近大自然，善待自己的身體，享受生活帶來的每分美好。",
            reversedDesc: "逆位的皇后警告你可能對身邊的人（如伴侶或孩子）產生了過度的保護與控制慾，導致關係緊張。這也可能代表創造力受阻，或是物質生活上的過度浪費。請學會適度放手，讓生命能量重新自然流動。"
        },
        {
            id: 4, name: "皇帝 (The Emperor)", icon: "fa-chess-king",
            uprightKeyword: "權威、穩定、結構、保護",
            reversedKeyword: "控制慾強、濫用權力、缺乏自律",
            uprightDesc: "皇帝代表堅固的結構、法律秩序與理性的控制。正位代表你的事業或生活架構正處於穩定狀態。此時需要發揮自律性與邏輯思考，建立規則並勇敢承擔責任。你擁有足夠的權威與力量保護身邊的人。",
            reversedDesc: "逆位的皇帝暗示你可能顯得過於固執、暴政，或者是控制慾過強，導致人際關係的緊繃。另一方面，這也可能代表生活缺乏秩序與纪律。你需要檢視自己是否過於專制，或是有逃避承擔領導責任的傾向。"
        },
        {
            id: 5, name: "教皇 (The Hierophant)", icon: "fa-hands-praying",
            uprightKeyword: "傳統、信仰、導師、學習",
            reversedKeyword: "打破常規、反叛、思想教條化",
            uprightDesc: "教皇代表傳統智慧、社會規範與精神上的引導。正位意味著你可能在尋求某種導師的指引，或是遵守某種成熟的社會體制。這是一個適合在學校、體制內學習，或進行婚禮、簽約等具有儀式感事物的良好時機。",
            reversedDesc: "逆位的教皇暗示你正試圖打破傳統的框架，追尋自己獨特的價值觀。這是一個反叛、創新的能量。但也要注意，不要陷入教條式的偏執中。請在推翻舊體制的同時，確認自己不是為了反對而反對。"
        },
        {
            id: 6, name: "戀人 (The Lovers)", icon: "fa-heart",
            uprightKeyword: "選擇、結合、和諧、吸引力",
            reversedKeyword: "不合、錯誤選擇、關係失衡",
            uprightDesc: "戀人牌代表生命中的重要選擇，以及關係的和諧結合。正位不僅代表美好的愛情與吸引力，也象徵著內在核心價值的對齊。你需要做出一個誠實的、符合心靈指引的決定。這是一張帶來人緣與美好關係的祝福牌。",
            reversedDesc: "逆位的戀人警告你目前的關係或合作正處於失衡、不和諧的狀態。這可能代表做出了錯誤的選擇，或者逃避了溝通的責任。你需要重新檢視這段關係是否阻礙了你的個人成長，並重新對齊自己的核心價值。"
        },
        {
            id: 7, name: "戰車 (The Chariot)", icon: "fa-gauge-high",
            uprightKeyword: "意志力、勝利、前進、控制",
            reversedKeyword: "失控、方向不明、挫折受阻",
            uprightDesc: "戰車代表強大的意志力與克服障礙獲得勝利的決心。正位提示你必須整合內在衝突的力量，將目標聚焦，並且勇往直前。不論遇到多大的反對聲音，只要保持專注與自律，你將成功克服逆境，取得最終的勝利。",
            reversedDesc: "逆位的戰車警告你可能正處於失控的狀態，或者力量用錯了方向。你可能感到挫折、被阻礙，或者在衝突中迷失。請先停下腳步，重新整理思緒，調整方向，避免在毫無準備的情況下強行衝刺導致兩敗俱傷。"
        },
        {
            id: 8, name: "力量 (Strength)", icon: "fa-shield-heart",
            uprightKeyword: "勇氣、耐力、內在力量、溫柔控制",
            reversedKeyword: "軟弱、自我懷疑、脾氣暴躁",
            uprightDesc: "力量牌象徵著「以柔克剛」的真正智慧。正位提示你此時不需要用暴力或強硬的態度去抗爭，而是應該運用愛、耐心與包容的內在力量去馴服狂野的現狀。你的堅韌不拔與溫柔力量，將為你帶來長遠的成功。",
            reversedDesc: "逆位的力量牌暗示你目前感到自我懷疑與軟弱，或者是脾氣過於暴躁，失去了情緒的掌控力。你可能試圖用強硬的方式去逼迫他人，卻效果不佳。請找回內在的平靜，用包容和耐性重新審視當下的難關。"
        },
        {
            id: 9, name: "隱士 (The Hermit)", icon: "fa-campground",
            uprightKeyword: "內省、尋求真理、獨處、指引",
            reversedKeyword: "孤立、寂寞、逃避現實、偏執",
            uprightDesc: "隱士牌代表向內探尋真理的階段。正位建議你暫時遠離喧囂的社交生活，給自己留出獨處的時間去思考與沉澱。你內在的智慧之燈會照亮前方的路。這不是孤立，而是一次深刻的自我探索與靈魂充電之旅。",
            reversedDesc: "逆位的隱士警告你可能把自己關得太緊，陷入了「孤立與寂寞」的惡性循環中。你可能在逃避現實問題，或是想法有些偏執。請適度打開你的心扉，接受外界的關心與協助，不要獨自承擔所有的壓力。"
        },
        {
            id: 10, name: "命運之輪 (Wheel of Fortune)", icon: "fa-dharmachakra",
            uprightKeyword: "命運、轉機、好運、順應變化",
            reversedKeyword: "壞運、抗拒改變、舊疾復發",
            uprightDesc: "命運之輪代表宇宙的循環與無常。正位象徵著一個意想不到的積極轉機即將到來，是運勢向上提升的吉兆。你需要做的是順應變化的浪潮，不要抗拒，相信命運的安排會把你帶到更好的彼岸。好運即將降臨。",
            reversedDesc: "逆位的命運之輪提示你可能正面臨運勢的低潮期，或者正處於不得不改變的無奈轉折點。你越是抗拒改變，感到的痛苦就會越多。請學會放手，接納這段過渡期，因為所有的低谷都是為了下一次的爬升做準備。"
        },
        {
            id: 11, name: "正義 (Justice)", icon: "fa-scale-balanced",
            uprightKeyword: "公平、誠實、法律、因果報應",
            reversedKeyword: "偏見、不公正、逃避責罰",
            uprightDesc: "正義牌代表絕對的平衡與因果關係。正位提示你做決定時必須要客觀理性，權衡利弊，誠實地面對事實。如果你過去付出了努力，現在將獲得公正的回報；如果你做錯了事，現在也將面臨修正的考驗。這是一張追求公平與承擔後果的牌。",
            reversedDesc: "逆位的正義暗示你正面臨某種不公正的待遇，或者你在做決策時帶有偏見、不夠誠實。你可能在試圖逃避自己做錯事的代價。請對自己保持絕對的誠實，承認自己的錯誤，才是重新找回人生平衡的唯一途徑。"
        },
        {
            id: 12, name: "倒吊人 (The Hanged Man)", icon: "fa-anchor",
            uprightKeyword: "換位思考、犧牲、等待、放手",
            reversedKeyword: "白費心機、停滯不前、抗拒犧牲",
            uprightDesc: "倒吊人代表主動的等待與視角的轉換。你被倒吊著，雖然動彈不得，但你卻能以完全不同的角度看世界。正位代表現在不適合強求行動，而是應該安靜等待，甚至做出暫時的犧牲以換取大局的圓滿。放手，往往是解決束縛的開始。",
            reversedDesc: "逆位的倒吊人暗示你可能感到生活完全停滯不前，且你對目前的「無能為力」感到憤怒與掙扎。你可能在做無謂的無用功，試圖強行衝破限制，卻只是白費心機。請學會臣服與接受現狀，有時「不作為」就是最好的作為。"
        },
        {
            id: 13, name: "死神 (Death)", icon: "fa-skull",
            uprightKeyword: "結束、轉變、新生、道別",
            reversedKeyword: "抗拒改變、拖泥帶水、停滯焦慮",
            uprightDesc: "死神並非代表肉體的死亡，而是象徵「一個舊階段的絕對結束與新生的開始」。正位提示你必須勇敢地對過往不合適的人、事、物進行道別。舊的不去，新的不來。當落葉歸根，肥沃的土壤才能長出全新的生命花朵。",
            reversedDesc: "逆位的死神暗示你明知道某些事情已經無可挽回，卻依然抗拒改變、拖泥帶水地死守著過去。這會讓你陷入極大的焦慮與痛苦中。請痛快地放手吧，唯有接受結束的事實，你才能看見轉折點後迎來的新生曦光。"
        },
        {
            id: 14, name: "節制 (Temperance)", icon: "fa-glass-water-droplet",
            uprightKeyword: "平衡、協調、融合、自我調整",
            reversedKeyword: "失衡、過度、缺乏配合、溝通不良",
            uprightDesc: "節制代表鍊金術般的融合與調和。正位代表你能夠將生活中的衝突力量（例如工作與家庭、情感與理智）做完美的平衡。你具備極佳的適應力與自我復原力。在溝通上也顯示出極高的EQ，能和諧地與他人達成共識。",
            reversedDesc: "逆位的節制警告你生活或感情正處於極度失衡的狀態。可能是某些習慣過度放縱，或是與他人的合作中缺乏協調性，產生嚴重的溝通障礙。請檢視自己是否有任何極端傾向，並重新尋找妥協的平衡點。"
        },
        {
            id: 15, name: "惡魔 (The Devil)", icon: "fa-fire",
            uprightKeyword: "慾望、束縛、物質誘惑、沉溺",
            reversedKeyword: "擺脫束縛、覺醒、自我解放",
            uprightDesc: "惡魔代表內在陰暗的慾望，以及被物質、享樂或不健康關係所產生的束縛。正位提示你正深陷於某種誘惑或成癮中（如金錢、不倫戀、壞習慣），你以為自己無能為力，但其實腳上的鎖鏈是鬆的。你需要看清幻象，重掌自由自主權。",
            reversedDesc: "逆位的惡魔是一個非常好的吉兆，代表你終於在精神上迎來了覺醒，準備擺脫長期束縛你的壞習慣、物質誘惑或是有毒的親密關係。你正在打破枷鎖，重新奪回靈魂的自由，是一次重獲自由解放的過程。"
        },
        {
            id: 16, name: "高塔 (The Tower)", icon: "fa-bolt-lightning",
            uprightKeyword: "突然變故、破壞、解構、頓悟",
            reversedKeyword: "恐懼改變、避免災難、痛苦拖延",
            uprightDesc: "高塔是塔羅牌中震撼度最高的一張牌，代表瞬間的解構與顛覆。正位通常代表生活正遭遇意想不到的突然衝擊（如突然的感情破裂、失業等）。但請記住，高塔崩塌是因為地基早已腐朽。這是宇宙在強行幫你拆除虛假的生活，迫使你重建真實的自我。",
            reversedDesc: "逆位的高塔暗示你正預感到某個危機即將爆發，並且在極力抗拒、試圖遮掩。但這種勉強的避免，只會拉長痛苦的時間，並無法阻止必須發生的重組。請學會勇敢面對崩潰，因為只有將殘骸清理乾淨，你才能建立更穩固的未來。"
        },
        {
            id: 17, name: "星星 (The Star)", icon: "fa-star-of-david",
            uprightKeyword: "希望、信念、寧靜、靈感發想",
            reversedKeyword: "失望、悲觀、失去信念、靈感枯竭",
            uprightDesc: "在高塔的風暴過後，星星帶來了無盡的寧靜、希望與靈性療癒力。正位象徵著內心的平靜正在復甦，是一張代表希望的指引之牌。你對未來重拾信念，並且在藝術創作上充滿靈感。相信一切的考驗都已過去，平靜的祝福即將臨到。",
            reversedDesc: "逆位的星星警告你目前正處於失望與悲觀的泥淖中。你失去了對未來的希望與信念，感到生活毫無靈性之美。這有時也代表創作者的靈感枯竭。請提醒自己，星星依然在夜空發光，只是你被烏雲遮蔽了雙眼。請給予自己時間去休養療癒。"
        },
        {
            id: 18, name: "月亮 (The Moon)", icon: "fa-moon",
            uprightKeyword: "不安、恐懼、幻想、欺騙",
            reversedKeyword: "撥雲見日、消除恐懼、真相大白",
            uprightDesc: "月亮牌代表幽暗、不安與未知的恐懼。正位暗示你當前面臨的情況充滿了迷霧，你可能在為未知的事物感到焦慮與惶恐，或者有人在暗中欺騙你。請注意，月光會扭曲事物的真實形狀。此時不要輕易下決定，先等待迷霧散去，以防陷入幻想中。",
            reversedDesc: "逆位的月亮代表迷霧正在漸漸退去，你內心深處的焦慮與恐懼開始被理智所克服。原本隱藏的謊言、祕密或是不明的情況，也將「真相大白、撥雲見日」。這是一次重新找回方向感、重回理性的美好過程。"
        },
        {
            id: 19, name: "太陽 (The Sun)", icon: "fa-sun",
            uprightKeyword: "成功、喜悅、活力、自信明亮",
            reversedKeyword: "短暫挫折、缺乏活力、過度自信",
            uprightDesc: "太陽是塔羅牌中極富正向能量的大吉牌，代表全然的成功、喜悅與真理。正位象徵著你的生命正處於陽光普照的耀眼時刻，充滿了健康、無比的生命力與自信。你的感情和事業都將迎來光明的前途，所有陰霾一掃而空。",
            reversedDesc: "逆位的太陽暗示你雖然依然處於相對順遂的狀態，但可能會遇到一些短暫的小挫折，或者感到了暫時的體力與熱情衰退。有時這也警告你是否過於驕傲、自滿或過度自信。請適度調整心態，保持謙遜，陽光依然會持續溫暖你。"
        },
        {
            id: 20, name: "審判 (Judgement)", icon: "fa-bell",
            uprightKeyword: "覺醒、召喚、重大決定、重獲新生",
            reversedKeyword: "自我懷疑、逃避決定、悔恨停滯",
            uprightDesc: "審判代表靈魂的覺醒與關鍵的決定。正位就像天使吹響了號角，召喚你告別過去，做出一個將改變人生的重大抉擇。如果你過去被某些包袱壓得喘不過氣，現在是獲得原諒、釋放、並「重獲新生」的黃金轉捩點。請順應召喚，勇敢前行。",
            reversedDesc: "逆位的審判暗示你正站在人生的十字路口，內心卻充滿了自我懷疑與恐懼，遲遲不肯做出決定。你可能陷入了過去的悔恨中，導致生活停滯不前。請放過過去做錯的自己，勇敢做出抉擇，否則只會被困在過往的殘骸裡。"
        },
        {
            id: 21, name: "世界 (The World)", icon: "fa-earth-americas",
            uprightKeyword: "圓滿、完成、旅程終點、成功整合",
            reversedKeyword: "未完結、目標落空、停滯不前",
            uprightDesc: "世界牌是 22 張大阿爾克那的終點，代表大圓滿。正位象徵著你的某個重要人生旅程（例如學業、重大專案、關係）已經達到了完美的終點與整合。你感到內心的踏實、成功與圓滿。這代表你完全被宇宙所祝福，準備邁向全新的循環。",
            reversedDesc: "逆的世界暗示你雖然離成功只剩最後一步，但目前仍有某些「未完結的瑣事」阻礙了最終的圓滿。你可能會感到有些遺憾、或者目標並未完全達成。請耐心檢查，把最後的細節處理乾淨，才能順利為這個章節畫下完美的句點。"
        }
    ];

    // ==========================================================================
    // 2. 占卜交互邏輯
    // ==========================================================================

    // 切換模式：單牌 / 三牌
    btnModeSingle.addEventListener('click', () => switchMode('single'));
    btnModeThree.addEventListener('click', () => switchMode('three'));

    function switchMode(mode) {
        if (currentMode === mode) return;
        currentMode = mode;
        
        // 切換按鈕激活狀態
        btnModeSingle.classList.toggle('active', mode === 'single');
        btnModeThree.classList.toggle('active', mode === 'three');
        
        // 切換牌陣顯示
        spreadSingleBox.style.display = mode === 'single' ? 'flex' : 'none';
        spreadThreeBox.style.display = mode === 'three' ? 'flex' : 'none';
        
        resetTable();
    }

    // 重置牌桌狀態
    function resetTable() {
        isShuffled = false;
        flippedCount = 0;
        drawnCards = [];
        stepText.textContent = "第一步：請點擊洗牌按鈕";
        interpretationSection.style.display = 'none';
        
        // 回復卡牌至未翻轉、未逆位、無內容狀態
        const placeholders = document.querySelectorAll('.tarot-placeholder');
        placeholders.forEach(ph => {
            ph.classList.remove('flipped', 'reversed');
            const cardFront = ph.querySelector('.card-front');
            cardFront.innerHTML = `
                <span class="card-name">?</span>
                <span class="card-orientation">?</span>
            `;
        });
    }

    // 洗牌功能
    btnShuffle.addEventListener('click', () => {
        resetTable();
        
        const tableCard = document.getElementById('tarot-table-section');
        tableCard.classList.add('shuffling');
        stepText.textContent = "🔮 命運正在重新排列，洗牌中...";
        
        // 隨機模擬洗牌動畫 1.5 秒
        setTimeout(() => {
            tableCard.classList.remove('shuffling');
            isShuffled = true;
            stepText.textContent = currentMode === 'single' ? "第二步：請點擊抽取「今日啟示」卡牌" : "第二步：請依序點擊抽取「過去、現在、未來」三張卡牌";
            
            // 隨機洗牌演算法 (Fisher-Yates Shuffle)
            const shuffledDeck = [...tarotDeck];
            for (let i = shuffledDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
            }

            // 根據模式抽取卡片數量
            const numToDraw = currentMode === 'single' ? 1 : 3;
            for (let i = 0; i < numToDraw; i++) {
                const isReversed = Math.random() < 0.35; // 35% 機率為逆位
                drawnCards.push({
                    card: shuffledDeck[i],
                    isReversed: isReversed
                });
            }
        }, 1500);
    });

    // 監聽卡牌點擊事件進行 3D 翻轉與解密
    const placeholders = document.querySelectorAll('.tarot-placeholder');
    placeholders.forEach(ph => {
        ph.addEventListener('click', () => {
            if (!isShuffled) {
                alert("請先點選右上角「均勻洗牌」按鈕，注入您的意念！");
                return;
            }

            // 如果已經翻轉過，則不重複執行
            if (ph.classList.contains('flipped')) return;

            const slotIndex = parseInt(ph.getAttribute('data-slot'));
            const cardData = drawnCards[slotIndex];
            
            if (!cardData) return;

            // 1. 設定牌面圖示與名稱
            const cardFront = ph.querySelector('.card-front');
            const orientationText = cardData.isReversed ? '逆位' : '正位';
            const iconClass = cardData.card.icon;
            
            cardFront.innerHTML = `
                <i class="fa-solid ${iconClass} card-illustration"></i>
                <span class="card-name">${cardData.card.name.split(' ')[0]}</span>
                <span class="card-orientation">${orientationText}</span>
            `;

            // 2. 如果是逆位，為容器加上 .reversed 類以觸發 CSS 180度倒轉
            if (cardData.isReversed) {
                ph.classList.add('reversed');
            }

            // 3. 加上 .flipped 觸發 Y 軸 3D 翻轉動畫
            ph.classList.add('flipped');
            flippedCount++;

            // 4. 確認是否全部抽完
            const requiredCount = currentMode === 'single' ? 1 : 3;
            if (flippedCount === requiredCount) {
                stepText.textContent = "🎉 占卜完成！已在下方為您解讀牌意。";
                renderInterpretations();
            } else {
                stepText.textContent = `已抽取 ${flippedCount} 張牌，請繼續點選抽取未翻開的牌卡`;
            }
        });
    });

    // ==========================================================================
    // 3. 牌意解析渲染邏輯
    // ==========================================================================

    function renderInterpretations() {
        readingsContainer.innerHTML = '';
        
        drawnCards.forEach((data, index) => {
            const card = data.card;
            const isReversed = data.isReversed;
            
            const positionLabel = currentMode === 'single' ? '今日指引' : (index === 0 ? '過去 (Past)' : (index === 1 ? '現在 (Present)' : '未來 (Future)'));
            const orientClass = isReversed ? 'orient-reversed' : 'orient-upright';
            const orientText = isReversed ? '逆位' : '正位';
            const keyword = isReversed ? card.reversedKeyword : card.uprightKeyword;
            const interpretation = isReversed ? card.reversedDesc : card.uprightDesc;

            const blockHtml = `
                <div class="reading-block animate-fade-in">
                    <div class="reading-card-info">
                        <div class="reading-card-name">${card.name.split(' ')[0]}</div>
                        <span class="reading-card-orient ${orientClass}">${positionLabel} • ${orientText}</span>
                    </div>
                    <div class="reading-text">
                        <h3>能量焦點：${keyword}</h3>
                        <p class="desc-meta">卡牌象徵意義：${card.name}</p>
                        <p>${interpretation}</p>
                    </div>
                </div>
            `;
            readingsContainer.insertAdjacentHTML('beforeend', blockHtml);
        });

        // 呈現解密區並平滑滾動
        interpretationSection.style.display = 'block';
        interpretationSection.scrollIntoView({ behavior: 'smooth' });
    }
});
