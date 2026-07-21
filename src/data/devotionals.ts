/** 2-minute daily devotionals, rotate by day-of-year. Expand toward 365. */
export interface Devotional {
  title: string;
  body: string;
  prayer: string;
}

export const devotionals: Devotional[] = [
  {
    title: 'The Gift of Stillness',
    body:
      'Most of us meet the morning already running — messages, headlines, obligations. ' +
      'Psalm 46 was written in a time of upheaval, yet its center is a whisper: be still. ' +
      'Stillness is not doing nothing; it is remembering who holds everything. ' +
      'For two minutes, let your shoulders drop. The world will keep spinning without ' +
      'your help — it always has. That is not your failure. That is His faithfulness.',
    prayer: 'Lord, quiet the noise in me. Help me trust that You are God and I am not. Amen.',
  },
  {
    title: 'Strength That Isn’t Yours',
    body:
      'Paul wrote “I can do all things” from a prison cell, not a summit. The strength he ' +
      'describes is not self-confidence; it is borrowed strength — the kind that arrives ' +
      'exactly when yours runs out. Whatever today asks of you, you were never meant to ' +
      'carry it alone. Ask. Receive. Walk.',
    prayer: 'Jesus, be my strength where I am weak today. I hand You what feels too heavy. Amen.',
  },
  {
    title: 'Led, Not Driven',
    body:
      'A shepherd walks ahead; a driver pushes from behind. Psalm 23 insists that God ' +
      'leads — to green pastures, beside still waters. If your faith has felt like being ' +
      'driven — hurried, pressured, afraid — that voice is not the Shepherd’s. ' +
      'Today, listen for the voice that leads gently, and follow one step at a time.',
    prayer: 'Shepherd of my soul, teach me the sound of Your voice. Lead me today. Amen.',
  },
  {
    title: 'Rest for the Weary',
    body:
      'Jesus did not say “come to me, all you who have it together.” He called the tired, ' +
      'the burdened, the ones barely holding on. Rest is not a reward for finishing your ' +
      'work; it is a gift offered in the middle of it. Come as you are — that is the ' +
      'whole invitation.',
    prayer: 'Lord, I come tired. Trade my heaviness for Your rest. Amen.',
  },
  {
    title: 'A Future and a Hope',
    body:
      'Jeremiah 29:11 was written to exiles — people whose plans had collapsed. God’s ' +
      'promise wasn’t an instant rescue; it was His character: I have not forgotten you. ' +
      'Your setback is not the end of your story. The Author is still writing.',
    prayer: 'Father, when I can’t see the way, help me trust the One who does. Amen.',
  },
  {
    title: 'Lean In',
    body:
      'Your own understanding is a fine tool and a terrible master. Proverbs invites us ' +
      'to trust with all the heart — not because thinking is wrong, but because our view ' +
      'is small. Bring God the decision you keep turning over. Then listen longer than ' +
      'you speak.',
    prayer: 'Lord, I trust You with the decision on my mind right now. Make my path straight. Amen.',
  },
  {
    title: 'The Antidote to Anxiety',
    body:
      'Paul’s prescription for anxiety is strangely specific: pray about everything, and ' +
      'add thanksgiving. Gratitude is not denial — it is widening the frame until God’s ' +
      'past faithfulness is back in the picture. Name three things you’re thankful for. ' +
      'Watch what it does to the fear.',
    prayer: 'God of peace, guard my heart and mind today. I give You my worries, one by one. Amen.',
  },
  {
    title: 'Light in the Dark',
    body:
      'John did not promise a life without darkness. He promised that the darkness does ' +
      'not win. A single candle does not argue with the night; it simply burns, and the ' +
      'dark gives way. You do not have to fix everything today. You only have to keep your ' +
      'small light lit — and trust the One who is Light itself to do the rest.',
    prayer: 'Jesus, Light of the world, shine in the corners of me that feel dark today. Amen.',
  },
  {
    title: 'Enough for Today',
    body:
      'Manna could not be stored. Each morning the people gathered just enough, and tomorrow ' +
      'they gathered again. God trains us to trust one day at a time — not because He is ' +
      'stingy, but because daily bread makes for a daily relationship. Do not carry tomorrow’s ' +
      'weight into today. Today has enough grace of its own.',
    prayer: 'Father, give me today my daily bread — and the peace to leave tomorrow with You. Amen.',
  },
  {
    title: 'Known and Loved',
    body:
      'Before you formed a single thought this morning, you were already known. Psalm 139 ' +
      'says God knit you together and knows when you sit and when you rise. You are not a ' +
      'stranger begging for attention. You are a child, fully known and — astonishingly — ' +
      'fully loved. Let that be the ground you stand on today.',
    prayer: 'Lord, thank You that I am fully known and still fully loved. Steady me in that. Amen.',
  },
  {
    title: 'The Long Obedience',
    body:
      'Faithfulness is rarely dramatic. It is mostly showing up — one prayer, one kindness, ' +
      'one honest choice at a time. A river carves a canyon not by force but by returning to ' +
      'the same path every day. Your small, repeated yes to God is doing more than you can ' +
      'see. Keep returning.',
    prayer: 'Lord, make me faithful in small things today, trusting You with the shape of the whole. Amen.',
  },
  {
    title: 'When You Feel Forgotten',
    body:
      'Hagar, alone in the desert, gave God a name: “the God who sees me.” When no one else ' +
      'noticed her, He did. If today you feel overlooked — by people, by circumstances, even ' +
      'by your own hopes — hear this: you are seen. Nothing about your life is invisible to ' +
      'the One who counts the stars and calls them each by name.',
    prayer: 'God who sees me, thank You that I am never truly alone. Meet me here. Amen.',
  },
  {
    title: 'The Gift You Didn’t Earn',
    body:
      'Grace is offensive to the part of us that wants to earn its place. But Ephesians is ' +
      'clear: you are saved by grace, through faith, and this is not from yourself — it is a ' +
      'gift. You can stop auditioning for love you already have. Rest is not the reward for ' +
      'finishing; it is the gift that lets you begin again.',
    prayer: 'Father, I receive what I could never earn. Thank You for grace. Teach me to rest in it. Amen.',
  },
  {
    title: 'Streams in the Desert',
    body:
      'Isaiah speaks of rivers in the wasteland — water where you would swear nothing could ' +
      'grow. Your dry season is not the end of the story. God specializes in making life ' +
      'spring up in the exact places we had written off. Watch the ground you gave up on. ' +
      'He is not finished there.',
    prayer: 'Lord, bring streams to the dry places in me. I trust You to make things new. Amen.',
  },
  {
    title: 'Casting, Not Carrying',
    body:
      'Peter uses a physical word: cast. Throw your anxiety onto God the way you would hurl a ' +
      'heavy pack off your shoulders. Why? “Because he cares for you.” Worry pretends to be ' +
      'useful, as if enough turning it over will solve it. It won’t. Prayer moves the weight ' +
      'to the only One strong enough to hold it.',
    prayer: 'Lord, I cast my worry on You — really, not just in words. Carry what I cannot. Amen.',
  },
  {
    title: 'The Voice That Calls You Good',
    body:
      'Before Jesus performed a single miracle, the Father said, “This is my beloved Son, in ' +
      'whom I am well pleased.” His belovedness came first, not as a wage for work done. Yours ' +
      'does too. You do not have to achieve your way into being loved. You get to work from ' +
      'love, not for it.',
    prayer: 'Father, let me hear You call me beloved before I do anything today. Amen.',
  },
  {
    title: 'Do Not Despise Small Beginnings',
    body:
      'Zechariah asks who dares despise the day of small things. We want the finished cathedral; ' +
      'God delights in the first laid stone. Whatever you are starting — a habit, a healing, a ' +
      'reconciliation — do not measure it by how little it looks today. Great things almost ' +
      'always begin embarrassingly small.',
    prayer: 'Lord, bless the small beginning in front of me. Help me be faithful with little. Amen.',
  },
  {
    title: 'He Restores',
    body:
      'The shepherd of Psalm 23 does not drive the sheep onward when they are spent. He makes ' +
      'them lie down; He leads them to still water; He restores the soul. If you are running on ' +
      'empty, the holiest thing you can do may be to stop. Restoration is not laziness. It is ' +
      'obedience to a God who built you to need rest.',
    prayer: 'Shepherd, lead me beside still waters today. Restore what is worn thin in me. Amen.',
  },
  {
    title: 'Love in the Ordinary',
    body:
      'Paul’s famous description of love is not sentimental — it is practical, almost mundane. ' +
      'Patient. Kind. Not easily angered. Keeps no record of wrongs. This is love with its ' +
      'sleeves rolled up, love for Tuesday afternoons and difficult people. Ask not “do I feel ' +
      'love?” but “can I be patient here, kind here, forgiving here?”',
    prayer: 'Lord, make me patient and kind today, especially where it costs me something. Amen.',
  },
  {
    title: 'The Weight of Glory',
    body:
      'Paul calls his hardships “light and momentary” — and this from a man beaten and ' +
      'imprisoned. He could say it because he measured his troubles against an eternity of ' +
      'glory. Your pain is real; he never pretends otherwise. But it is not the largest thing ' +
      'in view. Something far heavier and far kinder is coming.',
    prayer: 'Father, when today feels heavy, lift my eyes to what lasts. Carry me through. Amen.',
  },
  {
    title: 'Return to Me',
    body:
      'The prophets’ most repeated word is not “try harder” but “return.” God is forever ' +
      'inviting His people back — not with a lecture, but with open arms. If you have drifted, ' +
      'the way home is shorter than you fear. One honest turn of the heart, and you will find ' +
      'Him already running toward you.',
    prayer: 'Father, I turn back to You today. Thank You for meeting me before I even arrive. Amen.',
  },
  {
    title: 'Be Still',
    body:
      '“Be still, and know that I am God.” The stillness comes first, then the knowing. We try ' +
      'to reason our way to peace and end up more tangled. Sometimes faith is simply ceasing to ' +
      'strive — letting your hands unclench long enough to remember who is actually holding the ' +
      'world together. It was never you.',
    prayer: 'God, quiet my striving. Help me be still long enough to remember You are God. Amen.',
  },
  {
    title: 'The Friend Who Stays',
    body:
      'Proverbs says there is a friend who sticks closer than a brother. In a world of people ' +
      'who come and go, Jesus is the one who stays — through the failure, the silence, the long ' +
      'night. You are not too much for Him, and you are never too far gone. He is not looking ' +
      'for a reason to leave. He is the friend who stays.',
    prayer: 'Jesus, thank You for staying when others could not. Help me rest in Your faithfulness. Amen.',
  },
  {
    title: 'Joy Comes in the Morning',
    body:
      'The psalmist does not deny the weeping; he says it “may last for the night.” Night is ' +
      'real. But it is not permanent. Grief has a morning on the other side of it, and the God ' +
      'who holds your tears in a bottle has not lost track of a single one. Hold on. Morning is ' +
      'a promise, not a maybe.',
    prayer: 'Lord, in my night, help me trust the morning You have promised. Hold my tears. Amen.',
  },
];
