module.exports = {
    ModerationName: 'sed_god',
    TalalaToBoldRegexp: /[тТ]ал((ыч|ый|ому)|[аы]л(а|уш)?)(.*|а|е|у)?|talal(a|usha|.*)?|[иИ]гнат(ий|ию|у|е|.*)?|[Аа]ртем(.*|у|е|ы|а)?|[Аа]н(д)?жел(.*|у|е|ы|а)?|[Aa]ngel(.*)?|[Tt]alov(.*)?|[Тт]алов(.*)?/gi,
    notify_message: `Привет, если нужен бот для того, чтобы карты из чата отправлялись в игру и писались её параметры, то напиши !enable в чате (это автоматическое сообщние, и повторяться не будет)`,
    game_category: {
        osu: 21465
    },

}