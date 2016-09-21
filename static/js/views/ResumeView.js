window.app.views.Resume = Backbone.View.extend({
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
			"bio": "I've always had a natural curiosity and affinity for construction. Whether it was playing with Lego's, building a tree house, or even a trebuchet in my friends backyard, I often found myself tinkering around and building things. As a kid, this presented a few challenges since I really don't have much money. However, when my attention turned towards computing with the discovery of games like Super Mario World, Doom, Duke Nukem, and Quake, I found myself immersed in a whole new exciting and captivating virtual world. Over time, the same curiosity that had driven my pursuits in the physical realm, now crept into this virtual one. I found myself asking the same questions, and that eventually led to a pursuit in computer programming. It provided a platform on which I could build, but without the burden of having to buy materials or expensive equipment. Since a twenty line program cost the same as a 20k line program, I no longer had to worry about my wallet, and if I messed up, there were no materials to repurchase. The only thing I could lose was time, and even then I still gained experience from the failure.<br/><br/>Today, I still hold the same passion for programming that I did as a child. Except now I'm able to make a living out of it, and I've been fortunate to have made my passion into my profession. I'm currently living in Santa Monica, CA, but I'm originally from Rochester, NY. I moved out here in 2016 when I was offered a relocation package from my employer. I carefully considered this big life changing transition beforehand, and ultimately decided that I couldn't say no. I had nothing to lose, and a whole new exciting adventure ahead of me. I've thoroughly enjoyed my time out here, but from time to time I find myself missing a few things from back home. Garbage Plates, Genesee Beer, Rohrbach's Scotch Ale, and of course my friends and family too! I even miss the cold weather and clouds a little.",
			"jobs": [
				{
					"company": "Sixgill",
					"start": "2016",
					"end": "Present",
					"role": "Developer",
					"desc": "In early 2016, ZOS was rebranded as Sixgill, LLC.  I was offered relocation, and accepted a move to Santa Monica, CA.  I'm currently working on system monitoring and visualization tools, as well as helping in the redesign of core system components.",
					"img": "sixgill.png"
				},
				{
					"company": "ZOS Communications",
					"start": "2011",
					"end": "2016",
					"role": "Developer",
					"desc": "During my senior year of school I was assigned to a team where we worked on R&D for ZOS.  Our task was to develop a hybrid locationing system that could more accurately determine indoor device locations.  After completion I was offered a full-time job.  Over the 5 years that I worked for ZOS, I wrote many backend systems and customer facing websites.  I worked a multitude of areas, ranging from designing and implementing a big data heatmap generator, writing programs to push real-time data accross networks /extract historial data, and frontend development.",
					"img": "zos.png"
				},
				{
					"company": "New Life Electronics",
					"start": "2010",
					"end": "2011",
					"role": "Developer",
					"desc": "Initially begun as a co-op, I was subsequently offered part-time employment while I finished my last year of college.  I worked on a LAMP stack, and wrote customer facing dashboards for this small IT company.  Towards the end of my time at NLE, I helped conceptualize and implement the companies virtual audio mixer interface.",
					"img": "nle.png"
				},
				{
					"company": "RIT FAST EWA",
					"start": "2009",
					"end": "2010",
					"role": "Developer",
					"desc": "I was hired as a co-op to develop campus wide faculty, staff, and student systems.  I wrote a front-end component for the schools employment website.",
					"img": "fast.png"
				}
			],
			"education": [
				{
					"school": "Rochester Institute of Technology",
					"start": "2006",
					"end": "2011",
					"degree": "BS Software Engineering",
					"img": "rit.png"
				}
			],
			"skills": ["Javascript", "HTML", "CSS", "C", "C++", "C#", ".NET", "VB", "Java", "Ruby", "PHP", "Linux", "SQL", "AWS"],
			"patents": [
				{
					"pubNumber": "US20130172006 A1",
					"name": "Hybrid location using a weighted average of location readings and signal strengths of wireless access points",
					"link": "https://www.google.com/patents/US20130172006"
				},
				{
					"pubNumber": "US20130173506 A1",
					"name": "Hybrid location using pattern recognition of location readings and signal strengths of wireless access points",
					"link": "https://www.google.com/patents/US20130173506"
				},
				{
					"pubNumber": "US20130165144 A1",
					"name": "Database seeding with location information for wireless access points",
					"link": "https://www.google.com/patents/US20130165144"
				},
				{
					"pubNumber": "	US8774830 B2",
					"name": "Training pattern recognition systems for determining user device locations",
					"link": "https://www.google.com/patents/US8774830"
				},
			]
		};
		
		// bio
		this.$('.bio-container').html(data.bio);
		
		// jobs
		var $jobDiv = this.$('.job-container');
		for (var i = 0; i < data.jobs.length; ++i) {
			
			var job = data.jobs[i];
			
			$jobDiv.append($(
				'<div>' +
				'<div style="display:inline-block;width:100%;">' +
				'<div class="emblem-image" style="background-image:url(static/imgs/' + job.img + ');"></div>' +
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
				'<div class="emblem-image" style="background-image:url(static/imgs/' + edu.img + ');"></div>' +
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
});