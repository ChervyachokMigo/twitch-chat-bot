module.exports = {
    ModerationName: 'sad_god_',
    TalalaToBoldRegexp: /[тТ]ал((ыч|ый|ому)|[аы]л(а|уш)?)(.*|а|е|у)?|talal(a|usha|.*)?|[иИ]гнат(ий|ию|у|е|.*)?|[Аа]ртем(.*|у|е|ы|а)?|[Аа]н(д)?жел(.*|у|е|ы|а)?|[Aa]ngel(.*)?|[Tt]alov(.*)?|[Тт]алов(.*)?/gi,
    notify_message: `Привет, если нужен бот для того, чтобы карты из чата отправлялись в игру и писались её параметры, то напиши !enable в чате (это автоматическое сообщние, и повторяться не будет)`,
    game_category: {
        osu: {
			id: '21465',
			aliases: ['osu!', 'osu', 'осу']
		},
		dota_2: {
			id: '29595',
            aliases: ['dota 2', 'dota2', 'dota', 'дота', 'дота 2']
		},
		zenless: {
			id: '456845141',
            aliases: ['zenless', 'зенлесс', 'zzz', 'zenless-zone-zero', 'zenless zone zero', 'ззз', 'зенлес']
		},
		
    },

}