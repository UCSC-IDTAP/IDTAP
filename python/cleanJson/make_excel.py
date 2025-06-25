import xlsxwriter, json, datetime, math, os, sys
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson import json_util

username = os.environ.get('USER_NAME')
password = os.environ.get('PASSWORD')
query = "mongodb+srv://" + username + ":" + password + "@swara.f5cuf.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(query)
transcriptions = client['swara']['transcriptions']
query = {'_id': ObjectId(sys.argv[1])}
data = transcriptions.find_one(query)



json_out_path = sys.argv[2]
xlcs_out_path = sys.argv[3]

# get rid of ratios
if 'phraseGrid' in data:
    phrases = data['phraseGrid'][0]
else:
    phrases = data['phrases']
for phrase in phrases:
    if 'trajectories' in phrase:
        trajectories = phrase['trajectories']
    else:
        trajectories = phrase['trajectoryGrid'][0]
    for trajectory in trajectories:
        for pitch in trajectory['pitches']:
            pitch.pop('ratios', None)

json.dump(data, open(json_out_path, 'w'), default=json_util.default)


def get_date_string(date):
    date = datetime.datetime.strptime(str(date), '%Y-%m-%d %H:%M:%S.%f')
    return date.strftime('%m/%d/%Y %I:%M %p')

def get_mod_date_string(date):
    date = datetime.datetime.strptime(str(date), '%Y-%m-%dT%H:%M:%S.%fZ')
    return date.strftime('%m/%d/%Y %I:%M %p')

def add_traj_headers(vstart):
    worksheet.set_row(vstart, 20)
    worksheet.set_row(vstart + 1, 30)
    
    worksheet.write(vstart, 1, 'Start Time', titleFormat)
    worksheet.write(vstart, 2, 'Duration', titleFormat)
    worksheet.merge_range(vstart, 3, vstart, 16, 'Trajectories', titleFormat)
    worksheet.write(vstart, 17, 'Chikaris', titleFormat)

    worksheet.merge_range(vstart + 1, 3, vstart + 2, 3, 'Num', titleFormat)
    worksheet.merge_range(vstart + 1, 4, vstart + 2, 4, 'Id', titleFormat)
    worksheet.merge_range(vstart + 1, 5, vstart + 2, 5, 'Id Name', titleFormat)
    worksheet.merge_range(vstart + 1, 6, vstart + 2, 6, 'Duration', titleFormat)
    worksheet.merge_range(vstart + 1, 7, vstart + 2, 7, 'Start Time*', titleFormat)
    worksheet.merge_range(vstart + 1, 8, vstart + 2, 8, 'Slope', titleFormat)
    worksheet.merge_range(vstart + 1, 9, vstart + 1, 11, 'Articulations', titleFormat)
    worksheet.write(vstart + 2, 9, 'time**', titleFormat)
    worksheet.write(vstart + 2, 10, 'type', titleFormat)
    worksheet.write(vstart + 2, 11, 'stroke', titleFormat)
    worksheet.merge_range(vstart + 1, 12, vstart + 1, 14, 'Pitches', titleFormat)
    worksheet.write(vstart + 2, 12, 'swara', titleFormat)
    worksheet.write(vstart + 2, 13, 'raised', titleFormat)
    worksheet.write(vstart + 2, 14, 'octave', titleFormat)
    title = 'Proportional Duration Within Phrase'
    worksheet.merge_range(vstart + 1, 15, vstart + 2, 15, title, titleFormat)
    title = 'Proportional Duration within Trajectory'
    worksheet.merge_range(vstart + 1, 16, vstart + 2, 16, title, titleFormat)
    title = 'Timing within Phrase'
    worksheet.merge_range(vstart + 1, 17, vstart + 2, 17, title, titleFormat)

def add_phrase(phrase, vstart, idx):
    add_traj_headers(vstart)
    art_start = vstart+3
    clen = len(phrase['chikaris'].keys())
    if 'trajectories' in phrase:
        trajectories = phrase['trajectories']
    else:
        trajectories = phrase['trajectoryGrid'][0]
    for tIdx, traj in enumerate(trajectories):
        # start with articulations and pitches, whatever the max of thaose are, 
        # that is the merge height for this traj
        arts = traj['articulations']
        art_tot = len(arts)
        pitches = traj['pitches']
        if traj['id'] == 0:
            pitches = pitches[:1]
        pitch_tot = len(pitches)
        vrange = art_tot if art_tot > pitch_tot else pitch_tot
        if vrange == 0:
            vrange = 1
        artKeys = arts.keys()
        if traj['id'] != 12:
            if len(artKeys) == 0:
                if tIdx == len(trajectories) - 1:
                    format = entryFormatEnd
                else:
                    format = entryFormat
                
                worksheet.merge_range(art_start, 9, art_start + pitch_tot - 1, 11, '', format)
            else:
                for aIdx, artKey in enumerate(artKeys):
                    if tIdx == len(trajectories) - 1 and aIdx == len(artKeys) - 1 and art_tot >= pitch_tot:
                        format = openEntryFormatEnd
                    elif aIdx == len(artKeys) - 1:
                        format = openTopEntryFormat
                    else:
                        format = openEntryFormat
                    art = arts[artKey]
                    worksheet.write(art_start + aIdx, 9, round(float(artKey), 2), format)
                    worksheet.write(art_start + aIdx, 10, art['name'], format)
                    if 'stroke' in art.keys():
                        worksheet.write(art_start + aIdx, 11, art['stroke'], format)
                    else:
                        worksheet.write(art_start + aIdx, 11, '', format)
                if art_tot < pitch_tot:
                    if tIdx == len(trajectories) - 1:
                        
                        format = entryFormatEnd
                    else:
                        format = entryFormat
                    worksheet.merge_range(art_start + art_tot, 9, art_start + pitch_tot - 1, 11, '', format)
            for pIdx, pitch in enumerate(pitches):
                
                if pIdx == pitch_tot - 1:
                    if tIdx == len(trajectories) - 1 and pitch_tot >= art_tot:
                        format = openEntryFormatEnd
                    else:
                        format = openTopEntryFormat
                elif pIdx == 0:
                    format = openBottomEntryFormat
                else:
                    format = openEntryFormat
                worksheet.write(art_start + pIdx, 12, pitch['swara'], format)
                worksheet.write(art_start + pIdx, 13, pitch['raised'], format)
                worksheet.write(art_start + pIdx, 14, pitch['oct'], format)
            daCt = 0
            for daIdx, da in enumerate(traj['durArray']):
                if daIdx == 0:
                    format = openBottomEntryFormat
                else:
                    format = openEntryFormat
                if tIdx == len(trajectories) - 1 and daIdx == len(traj['durArray'])-1:
                    
                    if daIdx == 0:
                        
                        format = entryFormatEnd
                    else:
                        format = openEntryFormat
                worksheet.write(art_start + daIdx, 16, round(da, 2), format)
                daCt += 1
            for daIdx in range(daCt, vrange):
                if tIdx == len(trajectories) - 1:
                    format = openEntryFormatEnd
                else:
                    format = openEntryFormat
                worksheet.write(art_start + daIdx, 16, '', format)
            
        else:
            if tIdx == len(trajectories) - 1 and clen != tIdx + 2:

                format = entryFormatEnd
            else:
                format = entryFormat

            worksheet.merge_range(art_start, 9, art_start, 11, '', format)
            worksheet.merge_range(art_start, 12, art_start, 14, '', format)
            worksheet.write(art_start, 16, 1, format)
            
        if vrange > 1:
            end = art_start + vrange - 1
            if tIdx == len(trajectories) - 1:
                format = entryFormatEnd
            else:
                format = entryFormat
            
            worksheet.merge_range(art_start, 3, end, 3, tIdx, format)
            worksheet.merge_range(art_start, 4, end, 4, traj['id'], format)
            worksheet.merge_range(art_start, 5, end, 5, traj['name'], format)
            worksheet.merge_range(art_start, 6, end, 6, round(traj['durTot'], 2), format)
            worksheet.merge_range(art_start, 7, end, 7, round(traj['startTime'], 2), format)
            if traj['id'] in [2, 3, 4, 5]:
                msg = round(traj['slope'], 2)
            else:
                msg = ''
            worksheet.merge_range(art_start, 8, end, 8, msg, format)
            worksheet.merge_range(art_start, 15, end, 15, round(phrase['durArray'][tIdx], 2), format)
                     
            art_start += vrange
        else:
            if tIdx == len(trajectories) - 1 and clen != tIdx + 2:
                format = entryFormatEnd
            else:
                format = entryFormat
            worksheet.write(art_start, 3, tIdx, format)
            worksheet.write(art_start, 4, traj['id'], format)
            worksheet.write(art_start, 5, traj['name'], format)
            worksheet.write(art_start, 6, round(traj['durTot'], 2), format)
            worksheet.write(art_start, 7, round(traj['startTime'], 2), format)
            if traj['id'] in ['2', '3', '4', '5']:
                 msg = round(traj['slope'], 2)
            else:
                msg = ''
            worksheet.write(art_start, 8, msg, format)
            worksheet.write(art_start, 15, round(phrase['durArray'][tIdx], 2), format)
            art_start += 1
    cstart = vstart + 3
    
    full_vrange = art_start - vstart - 3
    for cIdx, chikari in enumerate(phrase['chikaris'].keys()):
        if cIdx == full_vrange:
            format = entryFormatEnd
        else:
            format = entryFormat
        worksheet.write(cstart+cIdx, 17, float(chikari), format)

    # full_vrange = art_start - vstart - 3
    if clen <= full_vrange:
        if clen == full_vrange - 1 or clen == full_vrange:
            worksheet.write(cstart + clen, 17, '', entryFormatEnd)
        else:
            worksheet.merge_range(cstart + clen, 17, cstart + full_vrange - 1, 17, '', entryFormatEnd)
        vsize = full_vrange + 2
    else:
        worksheet.merge_range(cstart + clen - 1, 3, cstart + full_vrange, 16, '', entryFormatEnd)
        vsize = clen + 2
    worksheet.merge_range(vstart, 0, vstart + vsize, 0, idx, entryFormatEnd)
    worksheet.merge_range(vstart + 1, 1, vstart + vsize, 1, round(phrase['startTime'], 2), entryFormatEnd)
    worksheet.merge_range(vstart + 1, 2, vstart + vsize, 2, round(phrase['durTot'], 2), entryFormatEnd)
    return vstart + vsize + 1   


workbook = xlsxwriter.Workbook(xlcs_out_path)
workbook.set_size(2000, 1200)
worksheet = workbook.add_worksheet()

worksheet.set_column('A:A', 15)
worksheet.set_column('B:B', 30)
worksheet.set_column('C:C', 20)
worksheet.set_column('D:D', 20)
worksheet.set_column(5, 5, 15)
worksheet.set_column(10, 10, 12)
worksheet.set_column(15, 15, 15)
worksheet.set_column(16, 15, 15)

titleFormat = workbook.add_format({
    'bold': True, 
    'bg_color': '#D3D3D3',
    'align': 'center',
    'valign': 'vcenter',
    'border': 1,
    'text_wrap': True
    })

titleFormatEnd = workbook.add_format({
    'bold': True, 
    'bg_color': '#D3D3D3',
    'align': 'center',
    'valign': 'vcenter',
    'border': 1,
    'text_wrap': True,
    'bottom': 2
    })

entryFormat = workbook.add_format({
    'align': 'center',
    'valign': 'vcenter',
    'border': 1,
    'text_wrap': True
})

entryFormatEnd = workbook.add_format({
    'align': 'center',
    'valign': 'vcenter',
    'border': 1,
    'bottom': 2,
    'text_wrap': True
})

openEntryFormat = workbook.add_format({
    'align': 'center',
    'valign': 'vcenter',
    'left': 1,
    'right': 1,
    'text_wrap': True
})

openEntryFormatEnd = workbook.add_format({
    'align': 'center',
    'valign': 'vcenter',
    'left': 1,
    'right': 1,
    'bottom': 2,
    'text_wrap': True
})

openBottomEntryFormat = workbook.add_format({
    'align': 'center',
    'valign': 'vcenter',
    'left': 1,
    'right': 1,
    'top': 1,
    'text_wrap': True
})

openTopEntryFormat = workbook.add_format({
    'align': 'center',
    'valign': 'vcenter',
    'left': 1,
    'right': 1,
    'bottom': 1,
    'text_wrap': True
})

worksheet.write(0, 0, 'Title', titleFormat)
worksheet.write(0, 1, data['title'], entryFormat)

worksheet.write(1, 0, 'Date Created', titleFormat)
# worksheet.write(1, 1, get_mod_date_string(data['dateCreated']), entryFormat)
worksheet.write(1, 1, get_date_string(data['dateCreated']), entryFormat)


worksheet.write(2, 0, 'Date Modified', titleFormat)
worksheet.write(2, 1, get_date_string(data['dateModified']), entryFormat)

worksheet.write(3, 0, 'Transcriber', titleFormat)
worksheet.write(3, 1, data['name'], entryFormat)

worksheet.write(4, 0, '_ID', titleFormat)
worksheet.write(4, 1, str(data['_id']), entryFormat)

# raga
raga_start = 6
worksheet.merge_range(raga_start, 0, raga_start, 3, 'Raga', titleFormat)
worksheet.write(raga_start + 1, 0, 'Name', titleFormat)
worksheet.write(raga_start + 1, 1, 'Fundamental', titleFormat)
worksheet.write(raga_start + 1, 2, 'Ratios', titleFormat)
worksheet.write(raga_start + 1, 3, 'Cents', titleFormat)

ratios = data['raga']['ratios']
for i, item in enumerate(ratios):
    worksheet.write(i + raga_start + 2, 2, round(item, 4), entryFormat)
    cz = round(1200 * math.log2(item))
    worksheet.write(i + raga_start + 2, 3, cz, entryFormat)
merge_st = raga_start + 2
merge_end = merge_st + len(ratios) - 1
raga_name = data['raga']['name']
fundamental = round(data['raga']['fundamental'], 2)
worksheet.merge_range(merge_st, 0, merge_end, 0, raga_name, entryFormat)
worksheet.merge_range(merge_st, 1, merge_end, 1, fundamental, entryFormat)

# duration
duration_start = merge_end + 2
worksheet.merge_range(duration_start, 0, duration_start, 1, 'Duration', titleFormat)
worksheet.write(duration_start + 1, 0, 'Seconds', titleFormat)
worksheet.write(duration_start + 1, 1, 'Hours:Minutes:Seconds', titleFormat)
seconds = data['durTot']
worksheet.write(duration_start + 2, 0, seconds, entryFormat)
hrs = int(seconds // 3600)
mins = int((seconds - 3600 * hrs) // 60)
secs = int(seconds - 3600 * hrs - 60 * mins)
worksheet.write(duration_start + 2, 1, f'{hrs}:{mins}:{secs}', entryFormat)

# phrases
p_start = duration_start + 4
worksheet.merge_range(p_start, 0, p_start, 17, 'Phrases', titleFormatEnd)
worksheet.set_row(p_start, 30)

for pIdx, phrase in enumerate(phrases):
    if pIdx == 0:
        start = p_start + 1
    start = add_phrase(phrase, start, pIdx)

workbook.close()
# flags = os.O_RDWR | os.O_CREAT
# os.system("open " + xlcs_out_path)

