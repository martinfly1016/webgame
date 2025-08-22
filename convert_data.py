import zipfile, xml.etree.ElementTree as ET, json

NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

def read_shared(zf):
    with zf.open('xl/sharedStrings.xml') as f:
        root=ET.parse(f).getroot()
        return [si.find(NS+'t').text for si in root]

def read_sheet(zf, name, shared):
    with zf.open(name) as f:
        root=ET.parse(f).getroot()
    rows=[]
    for r in root.findall('.//'+NS+'row'):
        vals=[]
        for c in r.findall(NS+'c'):
            t=c.attrib.get('t')
            v=c.find(NS+'v')
            if v is None:
                vals.append('')
            else:
                val=v.text
                if t=='s':
                    val=shared[int(val)]
                vals.append(val)
        rows.append(vals)
    return rows

def convert_stations():
    zf=zipfile.ZipFile('1.xlsx')
    shared=read_shared(zf)
    rows=read_sheet(zf,'xl/worksheets/sheet1.xml',shared)
    header=rows[0]
    stations=[]
    for row in rows[1:]:
        data=dict(zip(header,row))
        codes=data.get('Metro/Toei Interchanges','')
        if not codes:
            continue
        codes=[c for c in codes.split(';') if c]
        stations.append({
            'name_en': data.get('Station (EN)',''),
            'name_jp': data.get('駅名（JP）',''),
            'codes': codes
        })
    with open('stations.json','w',encoding='utf-8') as f:
        json.dump(stations,f,ensure_ascii=False,indent=2)


def convert_lines():
    zf=zipfile.ZipFile('2.xlsx')
    shared=read_shared(zf)
    rows=read_sheet(zf,'xl/worksheets/sheet1.xml',shared)
    header=rows[0]
    mapping={}
    for row in rows[1:]:
        data=dict(zip(header,row))
        code=data.get('Code')
        color=data.get('Color Hex')
        if code and color:
            mapping[code]=color
    with open('lines.json','w',encoding='utf-8') as f:
        json.dump(mapping,f,ensure_ascii=False,indent=2)

if __name__=='__main__':
    convert_stations()
    convert_lines()
