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
];
