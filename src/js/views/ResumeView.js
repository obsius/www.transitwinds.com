window.app.setView('Resume', Backbone.View.extend({

	el: '<div class="fill"></div>',

	events: {
		'click .skill-tag': 'openLink'
	},
	
	initialize: function(options) {
		this.template = window.app.loadTemplate('resume', window.app.data);
		this.$el.append(this.template);
	
		this.$parent = options.$parent;
		
		this.render();
	},
	
	openLink: function(e) {
		window.open('http://www.google.com/search?q=' + $(e.target).html());
	},
	
	render: function() {
		
		var data = {
			jobs: [
				{
					company: 'Puma Mining',
					start: '2023',
					end: 'Present',
					role: 'Principal',
					desc: 'Puma Mining works closely with Orica to ensure the continued success of OREPro 3D and its supplemental products, as well as to assist the Orica Digital Solutions Team on other endeavors.',
					img: 'logos/puma.png'
				},
				{
					company: 'Orica',
					start: '2021',
					end: '2023',
					role: 'Senior Software Developer',
					desc: 'In May of 2021, OreControl Blasting Consultants was sold to Orica, one of the worlds largest providers of explosives for mining. I was brought into Orica to maintain the systems I had built over the preceding three years at OBC.',
					img: 'logos/orica.png'
				},
				{
					company: 'OreControl Blasting Consultants',
					start: '2018',
					end: '2021',
					role: 'Principal Software Engineer',
					desc: 'OBC provided surface mines around the world with detailed analysis and optimized geological models for daily grade control. My role began long before OBC was generating revenue and it was my responsibility to architect, develop, and implement the desktop software, back-end server systems, database, API, and all other software components. OBC was sold in May of 2021.',
					img: 'logos/obc.png'
				},
				{
					company: 'Sixgill',
					start: '2016',
					end: '2019',
					role: 'Developer',
					desc: 'In early 2016, ZOS was rebranded as Sixgill, LLC. I was offered relocation, and accepted a move to Santa Monica, CA. During my time at Sixgill I traveled and demod as a Sales Engineer, helped maintain legacy systems software, and worked on new systems development. New systems were written in Golang and deployed with orchestration tools like Docker and Kubernetes.',
					img: 'logos/sixgill.png'
				},
				{
					company: 'ZOS Communications',
					start: '2011',
					end: '2016',
					role: 'Software Engineer',
					desc: 'During my senior year of school I was assigned to a team where we worked on R&D for ZOS.  Our task was to develop a hybrid locationing system that could more accurately determine indoor device locations.  After completion I was offered a full-time job.  Over the 5 years that I worked for ZOS, I wrote many backend systems and customer facing websites.  I worked a multitude of areas, ranging from designing and implementing a big data heatmap generator, writing programs to push real-time data accross networks /extract historial data, and frontend development.',
					img: 'logos/zos.png'
				},
				{
					company: 'New Life Electronics',
					start: '2010',
					end: '2011',
					role: 'Software Engineer',
					desc: 'Initially begun as a co-op, I was subsequently offered part-time employment while I finished my last year of college.  I worked on a LAMP stack, and wrote customer facing dashboards for this small IT company.  Towards the end of my time at NLE, I helped conceptualize and implement the companies virtual audio mixer interface.',
					img: 'logos/nle.png'
				},
				{
					company: 'RIT FAST EWA',
					start: '2009',
					end: '2010',
					role: 'Software Developer Intern',
					desc: 'I was hired as a co-op to develop campus wide faculty, staff, and student systems.  I wrote a front-end component for the schools employment website.',
					img: 'logos/fast.png'
				}
			],
			education: [
				{
					school: 'Rochester Institute of Technology',
					start: '2006',
					end: '2011',
					degree: 'BS Software Engineering',
					img: 'logos/rit.png'
				}
			],
			skills: ['Javascript', 'React', 'THREE.js', 'HTML', 'CSS', 'C', 'C++', 'C#', '.NET', 'VB', 'Java', 'Ruby', 'PHP', 'Linux', 'SQL', 'AWS'],
			patents: [
				{
					pubNumber: 'US11681837B2',
					name: ' 3D block modelling of a resource boundary in a post-blast muckpile to optimize destination delineation',
					link: 'https://patents.google.com/patent/US11681837B2'
				},
				{
					pubNumber: 'US20130172006 A1',
					name: 'Hybrid location using a weighted average of location readings and signal strengths of wireless access points',
					link: 'https://patents.google.com/patent/US20130172006'
				},
				{
					pubNumber: 'US20130173506 A1',
					name: 'Hybrid location using pattern recognition of location readings and signal strengths of wireless access points',
					link: 'https://patents.google.com/patent/US20130173506'
				},
				{
					pubNumber: 'US20130165144 A1',
					name: 'Database seeding with location information for wireless access points',
					link: 'https://patents.google.com/patent/US20130165144'
				},
				{
					pubNumber: 'US8774830 B2',
					name: 'Training pattern recognition systems for determining user device locations',
					link: 'https://patents.google.com/patent/US8774830'
				},
			]
		};
		
		// jobs
		var $jobDiv = this.$('.job-container');
		for (var i = 0; i < data.jobs.length; ++i) {
			
			var job = data.jobs[i];
			
			$jobDiv.append($(
				'<div>' +
				'<div style="display:inline-block;width:100%;">' +
				'<div class="emblem-image" style="background-image:url(assets/' + job.img + ');"></div>' +
				'<div style="float:left;margin-left:10px;">' +
				'<h2>' + job.company + '</h2>' +
				'<h3>' + job.role + '</h3>' + 
				'</div>' +
				'<div style="float:right;"><h3>' + job.start + ' to ' + job.end + '</h3></div>' +
				'</div>' +
				'<br/>' +
				job.desc +
				((i < data.jobs.length - 1) ? '<hr/>' : '') +
				'</div>'
			));
		};
		
		// school
		var $eduDiv = this.$('.edu-container');
		for (var i = 0; i < data.education.length; ++i) {
			
			var edu = data.education[i];
			
			$eduDiv.append($(
				'<div style="display:inline-block;width:100%;">' +
				'<div class="emblem-image" style="background-image:url(assets/' + edu.img + ');"></div>' +
				'<div style="float:left;margin-left:10px;">' +
				'<h2>' + edu.school + '</h2>' +
				'<h3>' + edu.degree + '</h3>' +
				'</div>' +
				'<div style="float:right;"><h3>' + edu.start + ' to ' + edu.end + '</h3></div>' +
				'</div>' +
				'<br/>' +
				((i < data.education.length - 1) ? '<hr/>' : '')
			));
		};
		
		// skills
		var $skillDiv = this.$('.skills-container');
		_.each(data.skills, function(skill) {
			$skillDiv.append($('<div class="skill-tag">' + skill + '</div>'));
		});
		
		// patents
		var $patentDiv = this.$('.patent-container');
		for (var i = 0; i < data.patents.length; ++i) {
			
			var patent = data.patents[i];
			
			$patentDiv.append($(
				'<h2>' + patent.name + '</h2>' +
				'<h3><a href="' + patent.link + '" class="blue">' + patent.pubNumber + '</a></h3>' +
				((i < data.patents.length - 1) ? '<hr/>' : '')
			));
		};
		
		this.$parent.append(this.$el);
	}
}));