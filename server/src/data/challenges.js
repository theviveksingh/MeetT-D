const truthChallenges = [
  { id: 't1', text: "What's the most embarrassing thing you've ever done?", category: 'funny' },
  { id: 't2', text: "Have you ever lied to get out of trouble? What did you do?", category: 'bold' },
  { id: 't3', text: "What's your biggest regret in life so far?", category: 'personal' },
  { id: 't4', text: "What's the silliest fear you have?", category: 'silly' },
  { id: 't5', text: "Have you ever pretended to be sick to avoid something?", category: 'funny' },
  { id: 't6', text: "What's a secret you've never told anyone?", category: 'personal' },
  { id: 't7', text: "Have you ever cheated on a test or game?", category: 'bold' },
  { id: 't8', text: "What's the weirdest dream you've had recently?", category: 'silly' },
  { id: 't9', text: "Who was your first crush and what happened?", category: 'personal' },
  { id: 't10', text: "What's your most unpopular opinion?", category: 'bold' },
  { id: 't11', text: "Have you ever talked behind someone's back? Who?", category: 'bold' },
  { id: 't12', text: "What's the most childish thing you still do?", category: 'silly' },
  { id: 't13', text: "What's your guilty pleasure you wouldn't admit to most people?", category: 'personal' },
  { id: 't14', text: "Have you ever been caught doing something you shouldn't?", category: 'funny' },
  { id: 't15', text: "What's the most embarrassing song on your playlist?", category: 'funny' },
  { id: 't16', text: "What's a skill you wish you had?", category: 'personal' },
  { id: 't17', text: "Have you ever said 'I love you' without meaning it?", category: 'bold' },
  { id: 't18', text: "What's your biggest fear?", category: 'personal' },
  { id: 't19', text: "If you could relive one day of your life, which would it be?", category: 'personal' },
  { id: 't20', text: "What's the most annoying thing about your best friend?", category: 'funny' },
  { id: 't21', text: "Have you ever had a paranormal experience?", category: 'bold' },
  { id: 't22', text: "What's your most embarrassing memory from school?", category: 'funny' },
  { id: 't23', text: "What's a lie you told that eventually came back to haunt you?", category: 'bold' },
  { id: 't24', text: "What do you think happens after we die?", category: 'personal' },
  { id: 't25', text: "What's the strangest thing you've ever eaten?", category: 'silly' },
  { id: 't26', text: "Have you ever had a near-death experience?", category: 'bold' },
  { id: 't27', text: "What's the worst advice you've ever given someone?", category: 'funny' },
  { id: 't28', text: "What's your biggest accomplishment you're proud of?", category: 'personal' },
  { id: 't29', text: "Have you ever fallen asleep during an important event?", category: 'funny' },
  { id: 't30', text: "What would you do if you won the lottery?", category: 'funny' },
  { id: 't31', text: "What's the most rebellious thing you've ever done?", category: 'bold' },
  { id: 't32', text: "Who in this room would you most want to be stranded with?", category: 'bold' },
  { id: 't33', text: "What's your biggest pet peeve?", category: 'personal' },
  { id: 't34', text: "Have you ever stalked an ex on social media?", category: 'bold' },
  { id: 't35', text: "What's the worst grade you ever got?", category: 'funny' },
  { id: 't36', text: "What's something you're secretly very good at?", category: 'personal' },
  { id: 't37', text: "Have you ever ghosted someone? Why?", category: 'bold' },
  { id: 't38', text: "What's the most spontaneous thing you've ever done?", category: 'silly' },
  { id: 't39', text: "What's your biggest insecurity?", category: 'personal' },
  { id: 't40', text: "If you could switch lives with anyone here for a day, who would it be?", category: 'funny' },
  { id: 't41', text: "What's the most embarrassing text you've accidentally sent?", category: 'funny' },
  { id: 't42', text: "Have you ever had a paranormal crush on someone you've never met?", category: 'silly' },
  { id: 't43', text: "What's the worst date you've ever been on?", category: 'bold' },
  { id: 't44', text: "What's something you would never do even if someone paid you?", category: 'bold' },
  { id: 't45', text: "What's your most controversial food opinion?", category: 'funny' },
  { id: 't46', text: "Have you ever forgiven someone who didn't deserve it?", category: 'personal' },
  { id: 't47', text: "What's the bravest thing you've ever done?", category: 'bold' },
  { id: 't48', text: "If you could erase one event from history, what would it be?", category: 'personal' },
  { id: 't49', text: "What's the weirdest thing you believed as a child?", category: 'silly' },
  { id: 't50', text: "Have you ever been in love with two people at once?", category: 'bold' },
  { id: 't51', text: "What's something you pretend to like but actually hate?", category: 'funny' },
  { id: 't52', text: "What's your biggest 'what if' scenario in life?", category: 'personal' },
  { id: 't53', text: "Have you ever broken something and blamed someone else?", category: 'bold' },
  { id: 't54', text: "What's the most embarrassing thing you've ever worn?", category: 'funny' },
  { id: 't55', text: "What's a habit you're trying to break?", category: 'personal' }
];

const dareChallenges = [
  { id: 'd1', text: "Do your best impression of someone in this room", category: 'funny' },
  { id: 'd2', text: "Call a random contact in your phone and sing them happy birthday", category: 'bold' },
  { id: 'd3', text: "Send your most recent text message to the group chat", category: 'bold' },
  { id: 'd4', text: "Do 10 pushups right now", category: 'silly' },
  { id: 'd5', text: "Speak in an accent for the next 3 rounds", category: 'funny' },
  { id: 'd6', text: "Text your crush something embarrassing", category: 'bold' },
  { id: 'd7', text: "Let the group pick your profile picture for a week", category: 'silly' },
  { id: 'd8', text: "Do a dramatic reading of the last text you sent", category: 'funny' },
  { id: 'd9', text: "Show your search history to everyone", category: 'bold' },
  { id: 'd10', text: "Speak only in questions until the next round", category: 'silly' },
  { id: 'd11', text: "Let someone post anything they want on your social media", category: 'bold' },
  { id: 'd12', text: "Do your best dance move right now", category: 'funny' },
  { id: 'd13', text: "Share your screen without closing anything first", category: 'bold' },
  { id: 'd14', text: "Make a funny face and hold it for 30 seconds", category: 'silly' },
  { id: 'd15', text: "Call a friend and pretend you're a robot", category: 'funny' },
  { id: 'd16', text: "Eat a spoonful of hot sauce or condiment of choice", category: 'bold' },
  { id: 'd17', text: "Do your best celebrity impression", category: 'funny' },
  { id: 'd18', text: "Let the group go through your camera roll for 30 seconds", category: 'bold' },
  { id: 'd19', text: "Pretend to be a cat for the next minute", category: 'silly' },
  { id: 'd20', text: "Read aloud the last 5 songs on your playlist", category: 'funny' },
  { id: 'd21', text: "Send a voice message singing your favorite song", category: 'bold' },
  { id: 'd22', text: "Do the worm right now", category: 'silly' },
  { id: 'd23', text: "Give your phone to someone for 2 minutes", category: 'bold' },
  { id: 'd24', text: "Tell a joke and keep going until someone laughs", category: 'funny' },
  { id: 'd25', text: "Share the first photo on your camera roll", category: 'silly' },
  { id: 'd26', text: "Do an impersonation of the person to your left", category: 'funny' },
  { id: 'd27', text: "Let someone type a message to anyone from your phone", category: 'bold' },
  { id: 'd28', text: "Make up a rap about the person to your right", category: 'silly' },
  { id: 'd29', text: "Show your most used emoji", category: 'funny' },
  { id: 'd30', text: "Share your current phone battery percentage and be embarrassed about it", category: 'silly' },
  { id: 'd31', text: "Do a handstand or attempt to", category: 'bold' },
  { id: 'd32', text: "Read your last 3 sent texts dramatically", category: 'funny' },
  { id: 'd33', text: "Speak in third person for the next 2 rounds", category: 'silly' },
  { id: 'd34', text: "Show everyone your lock screen", category: 'bold' },
  { id: 'd35', text: "Do your best politician impression", category: 'funny' },
  { id: 'd36', text: "Call your mom and tell her you love her in a dramatic way", category: 'bold' },
  { id: 'd37', text: "Show the world what you're wearing right now", category: 'silly' },
  { id: 'd38', text: "Share your current location with the group", category: 'bold' },
  { id: 'd39', text: "Tell the story of how you got your first phone", category: 'funny' },
  { id: 'd40', text: "Let the group pick your display name for today", category: 'silly' },
  { id: 'd41', text: "Text yourself and read the message aloud", category: 'funny' },
  { id: 'd42', text: "Demonstrate your signature dance move", category: 'silly' },
  { id: 'd43', text: "Share the last person you texted and why", category: 'bold' },
  { id: 'd44', text: "Do your best sports commentator commentary on nothing", category: 'funny' },
  { id: 'd45', text: "Let someone rename you for the rest of the game", category: 'silly' },
  { id: 'd46', text: "Show your browser tabs", category: 'bold' },
  { id: 'd47', text: "Do an impression of your favorite teacher or professor", category: 'funny' },
  { id: 'd48', text: "Share your current screentime and react", category: 'silly' },
  { id: 'd49', text: "Make a 10-second apology video to someone in the group", category: 'bold' },
  { id: 'd50', text: "Walk like a model down an invisible runway", category: 'silly' },
  { id: 'd51', text: "Share your phone's wallpaper and explain why you chose it", category: 'funny' },
  { id: 'd52', text: "Send a compliment to the last person you called", category: 'bold' },
  { id: 'd53', text: "Demonstrate how you look when you're trying to be attractive", category: 'funny' },
  { id: 'd54', text: "Read your horoscope out loud and react", category: 'silly' },
  { id: 'd55', text: "Give a 30-second toast to the group", category: 'bold' }
];

const categoryFilter = {
  funny: ['t1', 't5', 't8', 't12', 't14', 't15', 't20', 't22', 't27', 't29', 't30', 't35', 't40', 't41', 't45', 't49', 't51', 't54', 'd1', 'd4', 'd5', 'd8', 'd10', 'd12', 'd17', 'd19', 'd20', 'd24', 'd25', 'd26', 'd29', 'd30', 'd32', 'd34', 'd35', 'd39', 'd41', 'd42', 'd44', 'd47', 'd49', 'd51', 'd53', 'd54'],
  bold: ['t2', 't7', 't10', 't11', 't17', 't21', 't23', 't26', 't31', 't32', 't34', 't37', 't43', 't44', 't47', 't50', 't53', 'd2', 'd3', 'd6', 'd9', 'd11', 'd13', 'd16', 'd21', 'd23', 'd27', 'd31', 'd34', 'd36', 'd38', 'd43', 'd45', 'd46', 'd49', 'd52', 'd55'],
  personal: ['t3', 't6', 't9', 't13', 't16', 't18', 't19', 't24', 't28', 't33', 't38', 't39', 't46', 't48', 't52', 't55', 'd17', 'd33', 'd40'],
  silly: ['t4', 't8', 't12', 't25', 't38', 't42', 't49', 'd4', 'd7', 'd10', 'd14', 'd19', 'd22', 'd25', 'd28', 'd30', 'd33', 'd37', 'd40', 'd42', 'd45', 'd48', 'd50', 'd54']
};

export function getRandomChallenge(type, category, excludeIds = [], customChallenges = []) {
  let pool = [];
  
  if (type === 'truth') {
    pool = [...truthChallenges];
  } else if (type === 'dare') {
    pool = [...dareChallenges];
  } else {
    pool = [...truthChallenges, ...dareChallenges];
  }

  if (category && category !== 'mixed' && categoryFilter[category]) {
    pool = pool.filter(c => categoryFilter[category].includes(c.id));
  }

  const customPool = customChallenges.filter(c => {
    if (type && c.type !== type) return false;
    if (category && category !== 'mixed' && c.category !== category) return false;
    return true;
  });

  const allChallenges = [...pool, ...customPool];
  const filtered = allChallenges.filter(c => !excludeIds.includes(c.id));
  
  if (filtered.length === 0) {
    return allChallenges.length > 0 ? allChallenges[0] : null;
  }

  return filtered[Math.floor(Math.random() * filtered.length)];
}

export { truthChallenges, dareChallenges };
