import requests # python -m pip install requests
import argparse # standard librarys below
import csv

def main():
    parser = argparse.ArgumentParser(description='Take a list of YouTube ids and return their dislike stats')
    parser.add_argument('-i', default='./new_ids.csv', type=str, help='The filepath for the input')
    parser.add_argument('-o', default='./new_data.csv', type=str, help='The filepath for the output')
    args = parser.parse_args()
    in_csv_path = vars(args)['i']
    out_csv_path = vars(args)['o']
    
    id_arr = []
    with open(in_csv_path, newline='') as csvfile:
        reader = csv.reader(csvfile, delimiter='\t', quotechar='|')
        for row in reader:
            id_arr.append(row)
        csvfile.close()
    out_file = open(out_csv_path, newline='',mode='w')
    writer = csv.writer(out_file, delimiter=',',quotechar='|',quoting=csv.QUOTE_MINIMAL)
    data_written = False
    for id in id_arr:
        url = f"https://returnyoutubedislikeapi.com/votes?videoId={id[0]}"
        r = requests.get(url)
        r_json = r.json()
        if not data_written:
            header = r_json.keys()
            writer.writerow(header)
            data_written=True
        writer.writerow(r_json.values())
    out_file.close()       
        


if __name__ == "__main__":
    main()