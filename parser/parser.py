#!/usr/bin/python

import sys
import json
import re
from os import listdir
from os.path import isfile, join

images_path = '../adventure/images'
image_files = [f for f in listdir(images_path) if isfile(join(images_path, f)) and '.jpg' in f]

def isNumberedSection(line):
    try: 
        int(line)
        return True
    except:
        return False

def isMultiEnemiesFightSection(section):
    if 'text' not in section.keys():
        return False
    return 'SKILL\r\nSTAMINA' in section['text']

def SingularEnemyFight(section):
    if 'text' not in section.keys():
        return False
    return re.search(r'.*SKILL.*STAMINA.*', section['text'])

def processFight(section):
    enemies = []
    if isMultiEnemiesFightSection(section):
        lines = section['text'].split('\n')
        stamina_line = lines.index('STAMINA\r')
        for i in range(stamina_line+1, len(lines), 3):
            if isinstance(lines[i], basestring) and isNumberedSection(lines[i+1]) and isNumberedSection(lines[i+2]):
                enemy_obj = {
                    'name': lines[i],
                    'skill': lines[i+1],
                    'stamina': lines[i+2],
                }
                enemies.append(enemy_obj)
            else: 
                break
    elif SingularEnemyFight(section):
        result = re.search('(.*)SKILL(.*)STAMINA(.*)', section['text'])
        name =  result.group(1).strip()
        skill = result.group(2).strip()
        stamina =  result.group(3).strip()
        enemy_obj = {
            'name': name,
            'skill': skill,
            'stamina': stamina,
        }
        enemies.append(enemy_obj)
    if SingularEnemyFight(section) or isMultiEnemiesFightSection(section):
        original_interaction = section['interaction']
        sequence = [{
            'fight' : enemies
        }]
        sequence.append(original_interaction)
        section['interaction'] = {
            'sequence': sequence
        }

def processContent(section_content, section_number):
    turn_to_rgx = '[Tt]{1}urn to (\\d+)'
    luck_str = 'Test your Luck'

    target_sections = list(set(re.findall(turn_to_rgx, section_content)))
    is_luck_section = luck_str in section_content

    options = []
    for section in target_sections:
        if not is_luck_section:
            options.append({
                'label': 'turn to page ' +  str(section),
                'do': ['goTo', str(section)],
            })
                
    processedSection = {
        'text': unicode(section_content, errors='ignore'),
    }

    if len(target_sections) == 1 and not is_luck_section:
        processedSection['interaction'] = options[0]
    elif len(target_sections) >= 1 and not is_luck_section:
        processedSection['interaction'] = {
            'oneOf': options
        }
    elif len(target_sections) == 2  and is_luck_section:
        processedSection['interaction'] = {
            'label': 'Test your luck',
            'lucky': ['goTo', str(target_sections[0])],
            'unlucky': ['goTo', str(target_sections[1])]
        }
    else:
        processedSection['interaction'] = '****TODO****'

    image_file = str(section_number) + '.jpg'
    if image_file in image_files:
        processedSection['image'] = image_file

    return processedSection

data = {}

try:
    input_file_path = '../original/Warlock_of_Firetop_Mountain_parsed.txt'
    input_file = open(input_file_path, 'r')
    section_content = ''
    section_number = 0
    previous_line = None
    for line in input_file.readlines():
        if line == '' or line == '\r\n':
            previous_line = line
            continue
        elif isNumberedSection(line) and previous_line =='\r\n':
            section_content = ''
            section_number+=1
        else:
            section_content += line
        content = processContent(section_content, section_number)
        data[section_number] = content
        previous_line = line

finally:
    input_file.close()

output_file = '../adventure/scenes.json'

for section in data:
    processedSection = data[section]
    processFight(processedSection)


data_str = json.dumps(data)
output_file = open(output_file, 'w')
output_file.write(data_str)
output_file.close()
    
