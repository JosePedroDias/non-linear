import sys
import json
import re

def isNumberedSection(line):
    try: 
        int(line)
        return True
    except:
        return False

def processContent(section_content):
    turn_to_rgx = 'urn to ([0-9]*)'
    luck_str = 'Test your Luck'

    target_sections = list(set(re.findall(turn_to_rgx, section_content)))
    is_luck_section = luck_str in section_content

    options = []
    for section in target_sections:
        options.append({
                    'label': 'turn page',
                    'to': str(section),
                    })
                
    processedSection = {
        'text': unicode(section_content, errors='ignore'),
    }

    if(len(target_sections) or is_luck_section):
        processedSection['interactions'] = {
            'kind': 'luck' if is_luck_section else 'gotos',
            'options': options
        }

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
        content = processContent(section_content)
        data[section_number] = content
        previous_line = line

finally:
    input_file.close()

output_file = '../adventure/scenes.json'

data_str = json.dumps(data)
output_file = open(output_file, 'w')
output_file.write(data_str)
output_file.close()
    
