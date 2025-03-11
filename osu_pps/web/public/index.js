const mod_names = [
	'NF', 'EZ',
	'TD', 'HD', 'HR',
	'SD', 'DT', 'RX',
	'HT', 'NC',  'FL',
	'AP', 'SO'
];

const IntToMods = (mods_int) => {
	let result_mods = [];

	if (mods_int === 0){
		return ['NM'];
	}

	for ( let i = 0; i<mod_names.length; i++ ){
		if (mods_int >> i & 1){
			result_mods.push(mod_names[i]);
		}
	}
	
	return result_mods
}

const ModsToInt = (mods) => {
	let result = 0;

	for ( let i = 0; i<mod_names.length; i++ ){
		if (mods.indexOf(mod_names[i]) > -1){
			result = result | 1 << i;
		}
	}

	return result;
}

const parseNumber = (value, default_value) => {
	const result = Number(value);
	if (isNaN(result)) {
		return default_value;
	}
	return result;
}

const hide_form = () => {
	$('.form_outside').hide();
	$('.show_button').show();
}

const toggle_form = () => {
	if ($('.form_outside').css('display') === 'none') {
		$('.form_outside').show();
        $('.show_button').hide();
	} else {
		hide_form();
	}
}

let statuses_count = 0;
const statuses = [];

const remove_status = () => {
	const idx = statuses.findIndex( v => !v.is_remove);
	if (idx === -1) {
		console.log('no statuses to remove');
		return;
	}
	statuses[idx].is_remove = true;
	const el = statuses[idx].el;
	setTimeout(()=> el.fadeOut(500, () => el.remove()), 80 * statuses[idx].text_length ); 
}

const add_status = (text) => {
	const idx = statuses_count++;
	const el = $(`<div>`, {
		class: `status_item`, 
		text,
		id: `status_${idx}`
	});
	statuses.push({el, idx, text_length: text.length, is_remove: false});

	el.appendTo('.status_items').hide().fadeIn(300);

}

const host = 'svdgod.ru';

let token = '';

const post = async (action_name, request_args) => {
	return new Promise ( (res ,rej) => {
		console.log('fetch', `https://${host}/${action_name}`);
		fetch(`https://${host}/${action_name}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(request_args)
		}).then( response => response.json())
		.then( data => res (data))
		.catch( error => {
			console.log(error)
			rej({ error });
		});
	});
}

let last_data = [];
const page_size = 10;
let current_page = 0;

const page_control = (val) => {
	current_page += val;
	if (current_page < 0) {
		current_page = 0;
	} else if (current_page * page_size > last_data.length) {
		current_page = Math.floor(last_data.length / page_size);
	}
	render_beatmaps();
}

const format_time = (time_ms) => {
	let seconds = Math.floor(time_ms / 1000);
	let minutes = Math.floor(seconds / 60);
	let hours = Math.floor(minutes / 60);
	seconds %= 60;
	minutes %= 60;
	hours %= 60;
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const send_beatmap = (idx) => {
	const user = document.getElementById('osuname').value;

	add_status(`Отправка карты юзеру "${user}"`);

	post('send_beatmap_to_osu', { beatmap: last_data[idx], user })
		.then(data => {
			if (data.error) {
				console.error(data.error);
			} else {
				console.log(data)
			}
		})
		.finally( () => {
			remove_status();
		});
}

const play_preview = (button, beatmapset_id) => {
	$('.audio_play').val('Прослушать');
	const url = `https://b.ppy.sh/preview/${beatmapset_id}.mp3`;
	const audio = document.getElementById('audio_player');
    if (audio.src == url){
        if (audio.paused){
            audio.play();
			button.value = 'Остановить';
        } else {
            audio.pause();
			button.value = 'Прослушать';
        }
    } else {
        audio.src = url;
        audio.play();
		button.value = 'Остановить';
    }
}

const render_beatmaps = () => {

	if (last_data.length == 0) {
		document.getElementById('current_page').innerHTML = '0 стр.';
		document.getElementById('output').innerHTML = '<div class="output_element"><div class="output_error">No beatmaps found.</div></div>';
		return;
	}

	document.getElementById('current_page').innerHTML = `${current_page + 1} из ${Math.ceil(last_data.length / page_size)} стр.`;

	let output_html = '';

	for (let i = 0; i < page_size; i++) {
		const idx = (current_page * page_size) + i;
		if (idx >= last_data.length) {
			break;
		}
		const beatmap = last_data[idx];

		

		if (i % 2 == 0) {
			output_html += `<div class="output_pair">`;
		}

		output_html += `<div class="output_element">
						<a href="https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}#osu/${beatmap.beatmap_id}">`;

		output_html += 	`<div class="output_preview">
							<img src="https://assets.ppy.sh/beatmaps/${beatmap.beatmapset_id}/covers/list.jpg"/>
						</div>`

		output_html += 	`<div class="output_desc">`;

		output_html += 	`<div class="output_title">
							${beatmap.artist} - ${beatmap.title} [${beatmap.difficulty}] by ${beatmap.creator}
						</div>`;

		output_html += 	`<div class="output_params">
							<span class="output_pp">PP: ${beatmap.pp_total.toFixed(0)}</span>
							<span class="output_BPM">🎵 ${beatmap.bpm_avg.toFixed(0)}</span>
							<span class="output_stars">⭐ ${beatmap.stars.toFixed(2)}</span>
							<span class="output_length">🕓 ${format_time(beatmap.total_time)}</span>
							<span class="output_stream">Stream: ${beatmap.stream_difficulty.toFixed(2)}</span>
							<span class="output_stream">Circles: ${beatmap.circles_percent.toFixed(2)}</span>
						</div>`;

		output_html += 	`</div></a>`;
			
		output_html += 	`<div class="output_control">
							<input class="audio_play" type="button" onclick="play_preview(this, ${beatmap.beatmapset_id});" value="Прослушать">
							<input type="button" onclick="send_beatmap(${idx});" value="Отправить">
						</div>`;
			
		output_html += '</div>';

		if (i > 0 && i % 2 == 1) {
			output_html += `</div>`;
		}

	}

	document.getElementById('output').innerHTML = output_html;

}

const set_last_data = (data) => {
	current_page = 0;
	last_data = data;
	last_data = last_data.map( v => ({...v, circles_percent: v.hit_count / (v.hit_count + v.slider_count) }));
}

const send_request = () => {

	set_last_data([]);
	render_beatmaps();
	hide_form();

	add_status('Запрос данных');

	const request = {
		acc: parseNumber(document.getElementById('acc').value, 100),
		pp_min: parseNumber(document.getElementById('pp_min').value, 300),
		pp_max: parseNumber(document.getElementById('pp_max').value, 350),
		gamemode: parseNumber(document.getElementById('gamemode').value, 0),
		bpm_min: parseNumber(document.getElementById('bpm_min').value, 0),
		bpm_max: parseNumber(document.getElementById('bpm_max').value, 1000),
		stream_min: parseNumber(document.getElementById('stream_min').value, 0),
		stream_max: parseNumber(document.getElementById('stream_max').value, 1000),
		mods_int: ModsToInt(document.getElementById('mods_int').value),
		osuname: document.getElementById('osuname').value
	}

	post('recomend', request)
		.then(data => {
			if (data.error) {
				console.error(data.error);
			} else {
				if (data.length > 0) {
					add_status(`Найдено ${data.length} карт`);
					remove_status();
					set_last_data(data);
					sort(document.getElementById('sort'));
				} else {
					add_status(`Ошибка: Карт не найдено`);
					remove_status();
				}
			}
		})
		.finally( () => {
			remove_status();
		});
	
	return false;
}

const sort_text_view = {
	PP_DESC: 'PP по-убыванию',
	PP_ASC: 'PP по-возрастанию',
    BPM_DESC: 'BPM по-убыванию',
    BPM_ASC: 'BPM по-возрастанию',
    STARS_DESC: 'Звезды по-убыванию',
    STARS_ASC: 'Звезды по-возрастанию',
	LENGTH_DESC: 'Длительность по-убыванию',
    LENGTH_ASC: 'Длительность по-возрастанию',
    STREAM_DESC: 'Сложность стрима по-убыванию',
    STREAM_ASC: 'Сложность стрима по-возрастанию',
	CIRCLES_ASC: 'Процент кругов по-возрастанию',
    CIRCLES_DESC: 'Процент кругов по-убыванию',
}

const sort = (el) => {
	const value = el.value;
	add_status(`Сортировка "${sort_text_view[value]}"`);
	last_data = last_data.sort(
		(a, b) => {
			switch (value) {
				case 'PP_DESC': return b.pp_total - a.pp_total;
				case 'PP_ASC': return a.pp_total - b.pp_total;
				case 'BPM_DESC': return b.bpm_avg - a.bpm_avg;
				case 'BPM_ASC': return a.bpm_avg - b.bpm_avg;
				case 'STARS_DESC': return b.stars - a.stars;
				case 'STARS_ASC': return a.stars - b.stars;
				case 'LENGTH_DESC': return b.total_time - a.total_time;
				case 'LENGTH_ASC': return a.total_time - b.total_time;
				case 'STREAM_DESC': return b.stream_difficulty - a.stream_difficulty;
				case 'STREAM_ASC': return a.stream_difficulty - b.stream_difficulty;
				case 'CIRCLES_ASC': return a.circles_percent - b.circles_percent;
				case 'CIRCLES_DESC': return b.circles_percent - a.circles_percent;
			}
		}
	);
	render_beatmaps();
	remove_status();
}

const find_beatmap = () => {
	const beatmap_url = document.getElementById('beatmap_url').value;
	const mods_int =  ModsToInt(document.getElementById('mods_int').value);

	set_last_data([]);
	render_beatmaps();
	hide_form();

	add_status('Поиск карты');

    post('find_beatmap', { beatmap_url, mods_int })
        .then(data => {
            if (data.error) {
                console.error(data.error);
				add_status(`Ошибка: ${data.error}`);
				remove_status();
            } else {
                set_last_data(data);
                render_beatmaps();
            }
        })
		.finally( () => remove_status() );    

    return false;
}

$( document ).ready( function() {

	hide_form();

	add_status('Загрузка');

	post('get_last_params')
		.then(data => {
			if (data.error) {
				console.error(data.error);
			} else {
				$('#gamemode').val(data.gamemode);
				$('#acc').val(data.acc);
				$('#pp_min').val(data.pp_min);
				$('#pp_max').val(data.pp_max);
				$('#bpm_min').val(data.bpm_min);
				$('#bpm_max').val(data.bpm_max);
				$('#stream_min').val(data.stream_min);
				$('#stream_max').val(data.stream_max);
				$('#mods_int').val(IntToMods(data.mods_int).join('+'));
				$('#osuname').val(data.osuname);
				send_request();
			}
		})
		.finally( () => remove_status() ); 
});