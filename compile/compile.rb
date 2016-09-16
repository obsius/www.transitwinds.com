=begin
	Combines and minifies all of the JS into one JS file.
	Merges all of the template files into one template file.
=end

require 'json'
require 'nokogiri'

temp_tpl_filename = 'temp_tpls.html';
finalize_filename = 'finalize.js';

build_dir = 'build'
base_dir = '..'

all_sources = []

# load the app config file
data = {}
File.open(base_dir + '/static/js/AppData.json', 'r') do |f|
	data = JSON.parse(f.read)
end

# parse relevant data
sources = data['sources']
thirdparty_sources = data['thirdpartySources']
js_filename = data['build']['jsSource']
tpl_filename = data['build']['tplSource']

# add the thirdparty sources
thirdparty_sources.each do |source|
	all_sources.push(source)
end

# add the main source
all_sources.push('static/js/app.js')

# add the domestic sources
ordered_sources = []
for i in 0..sources.length

	clean_run = true
	
	sources.each do |source, depends_on|
	
		index_source = ordered_sources.index(source) || -1;

		if (!depends_on.nil? && depends_on.length > 0)

			max_index_dependency = -1
			
			for index in 0..depends_on.length
				dependency_index = ordered_sources.index(depends_on[index]) || -1

				if (dependency_index > max_index_dependency)
					max_index_dependency = dependency_index
				end
			end

			if (index_source == -1 && max_index_dependency == -1)
				ordered_sources.push(source)
				clean_run = false
			else
				if (index_source == -1)
					ordered_sources.insert(max_index_dependency + 1, source)
					clean_run = false
				elsif (index_source < dependency_index)
					ordered_sources.delete_at(index_source)
					ordered_sources.insert(max_index_dependency, source)
					clean_run = false
				end
			end
		elsif (index_source == -1)
			ordered_sources.push(source)
			clean_run = false
		end
	end

	break if clean_run
	raise 'circular dependencies' if (i == sources.length - 1 && !clean_run)
end

all_sources = all_sources + ordered_sources;

# modify file paths to include base dir
all_sources.map! do |source|
	base_dir + '/' + source
end

# add the finalize js
all_sources.push(finalize_filename);

# read all the tpls in
templates = []
Dir.glob(base_dir + '/static/tpls/**/*').select do |filename|
	if File.file?(filename)
		File.open(filename, 'r') do |f|
			templates.push(f.read)
		end
	end
end

# write the tpls into the temp tpl file
templates.each do |tpl|
	File.open(temp_tpl_filename, 'a') { |f| f.write(tpl) }
end

# create and clean the output dir
system('rd /S /Q ' + build_dir)
system('md ' + build_dir)

# copy content over
system('xcopy ' + base_dir + '\index.html ' + build_dir)
system('xcopy ' + base_dir + '\locales ' + build_dir + '\locales\* /e')
system('xcopy ' + base_dir + '\static\css ' + build_dir + '\static\css\* /e')
system('xcopy ' + base_dir + '\static\fonts ' + build_dir + '\static\fonts\* /e')
system('xcopy ' + base_dir + '\static\imgs ' + build_dir + '\static\imgs\* /e')
system('xcopy ' + base_dir + '\static\themes ' + build_dir + '\static\themes\* /e')
system('xcopy ' + base_dir + '\static\js\AppCodes.json ' + build_dir + '\static\js\*')
system('xcopy ' + base_dir + '\static\js\Timezones.json ' + build_dir + '\static\js\*')

# copy the new app data and index over
data['build']['compiled'] = true
data['thirdpartySources'] = [];
data['sources'] = [];
File.open(build_dir + '\static\js\AppData.json', 'w') { |f| f.write(data.to_json) }

# create dirs
Dir.mkdir(build_dir + '\static\tpls')

# run the minimizers
system('java -jar compiler.jar --jscomp_off=internetExplorerChecks --warning_level=QUIET --js ' + all_sources.join(' ') + ' --js_output_file ' + build_dir + '\static\js\\' + js_filename)
system('java -jar htmlcompressor.jar ' + temp_tpl_filename + ' -o ' + build_dir + '\static\tpls\\' + tpl_filename)

# cleanup
spawn('del ' + temp_tpl_filename)